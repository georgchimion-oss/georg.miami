#!/usr/bin/env python3
"""
sites-stats.py v3 — per-host traffic stats with HUMAN filtering + geo.

Source classification (priority order):
  🏠/📱 you      → IP in known-ips.json with you=true (Georg's machines/phones)
  🤖 internal    → IP in known-ips.json you=false, OR private/Tailscale/loopback CIDR
  🕷️ scanner     → known scanner IP range, OR vuln-probe path (/wp-admin, /.env, ...)
  �a bot         → User-Agent matches a crawler/automation/monitor signature, or UA is empty
  💬 slack       → User-Agent contains 'Slack', or Slack IP range
  🌐 visitor     → a plausible real human (this is the only bucket that counts as traffic)

v3 changes vs v2:
  - NEW 'bot' bucket: Googlebot/Ahrefs/bingbot/curl/python/etc no longer counted as visitors.
    (This was the cause of dead sites showing "tons of visitors".)
  - Internal/Tailscale/private CIDRs classified as internal even if not in known-ips.
  - Offline geo (db-ip city lite, no SaaS): visitor IPs resolved to city/country.
  - Per-host: visitors_24h, unique_visitors_24h, top_cities. recent_visitors tagged with city.
"""
import datetime as dt
import gzip
import ipaddress
import bisect
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

LOG_DIR = Path("/var/log/nginx")
OUT = Path("/var/www/sites/sites/stats.json")
SITES_ROOT = Path("/var/www/sites")
KNOWN_IPS_PATH = Path("/var/www/sites/sites/known-ips.json")
GEO_DB_PATH = "/var/www/sites/sites/geo/dbip-city-lite.mmdb"
DC_PATH = "/var/www/sites/sites/geo/datacenter.txt"
VPN_PATH = "/var/www/sites/sites/geo/vpn.txt"

LINE_RE = re.compile(
    r'^(?P<ip>\S+)\s+(?P<host>\S+)\s+\[(?P<ts>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+\S+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<ref>[^"]*)"\s+"(?P<ua>[^"]*)"\s+(?P<rt>\S+)'
)

SKIP_HOSTS = {'_', 'localhost', '159.89.185.96', 'www.georg.miami', 'www'}
def is_noise_host(host: str) -> bool:
    if host in SKIP_HOSTS:
        return True
    if re.match(r'^\d+\.\d+\.\d+\.\d+$', host):
        return True
    # Only Georg's own domain counts. Foreign Host headers (parked domains,
    # scanners spoofing a Host) are noise and must not appear as "visitors".
    if not (host == "georg.miami" or host.endswith(".georg.miami")):
        return True
    return False

SCANNER_PATTERNS = re.compile(
    r"(/wp-admin|/wp-login|/wp-content|/wordpress|/\.env|/\.git|/\.ssh|/\.aws"
    r"|/solr/|/index\.php|/login\.php|/login_pic|/admin\.php|/admin/login"
    r"|/admin-ajax|/ignition/execute|/wls-wsat|/CoordinatorPort"
    r"|/apply_sec\.cgi|/cgi-bin|/info\.html|/info\.php|/phpmyadmin"
    r"|/photo/p/api|/_async/|/SOAPService|/tmui/locallb|/owa/auth"
    r"|/actuator|/api/json|/sitecore|/CFIDE|/HNAP1|/RPC2|/server-status"
    r"|/druid/|/jsonws/|/xmlrpc\.php|/api/atc|/api/v1/pods)",
    re.IGNORECASE
)

# Bot / crawler / automation / uptime-monitor User-Agent signatures.
BOT_UA_RE = re.compile(
    r"(bot\b|bots\b|crawl|spider|slurp|bingpreview|googlebot|bingbot|yandex|baidu|duckduck"
    r"|ahrefs|semrush|mj12|dotbot|dataforseo|petalbot|gptbot|oai-searchbot|chatgpt|claudebot|claude-web|anthropic"
    r"|ccbot|bytespider|amazonbot|applebot|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot"
    r"|headlesschrome|phantomjs|puppeteer|playwright|selenium"
    r"|python-requests|python-httpx|python-urllib|aiohttp|go-http-client|node-fetch|undici"
    r"|axios|libwww|curl/|wget|java/|httpclient|okhttp|scrapy|guzzle|restsharp"
    r"|masscan|zgrab|nmap|nuclei|censys|expanse|internet-measurement|paloalto|shodan|netsystemsresearch|leakix|odin"
    r"|uptime|pingdom|statuscake|uptimerobot|monitoring|site24x7|newrelic|datadog|probe|headless|scanner|survey|netcraft|domaincheck|uripreview|skypeuripreview|networkingextension|network/|feedfetcher|webcompat|preview/|fetcher|validator|inspect|lighthouse|pagespeed)",
    re.IGNORECASE
)

INTERNAL_NETS = [ipaddress.ip_network(n) for n in (
    "127.0.0.0/8", "::1/128", "10.0.0.0/8", "172.16.0.0/12",
    "192.168.0.0/16", "100.64.0.0/10", "169.254.0.0/16", "fc00::/7",
)]
SCANNER_NETS = [ipaddress.ip_network(n) for n in ("185.177.72.0/24",)]
SLACK_IP_PREFIXES = ("44.196.", "44.197.", "44.198.", "54.79.")


def ip_in(ip: str, nets) -> bool:
    try:
        a = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return any(a in n for n in nets)


def load_known_ips() -> dict:
    try:
        with open(KNOWN_IPS_PATH) as f:
            return json.load(f).get("ips", {})
    except Exception:
        return {}


_geo_reader = None
def _geo():
    global _geo_reader
    if _geo_reader is None:
        try:
            import maxminddb
            _geo_reader = maxminddb.open_database(GEO_DB_PATH)
        except Exception:
            _geo_reader = False
    return _geo_reader or None


def geo_city(ip: str):
    r = _geo()
    if not r:
        return None
    try:
        rec = r.get(ip)
        if not rec:
            return None
        city = (rec.get("city", {}) or {}).get("names", {}).get("en")
        ctry = (rec.get("country", {}) or {}).get("names", {}).get("en")
        if city and ctry:
            return f"{city}, {ctry}"
        return ctry or city
    except Exception:
        return None


_dc_ranges = None
_dc_starts = None
_dc_cache = {}

def _load_dc():
    """Load + merge datacenter/VPN CIDRs into disjoint sorted int ranges (one-time)."""
    global _dc_ranges, _dc_starts
    if _dc_ranges is not None:
        return _dc_starts, _dc_ranges
    raw = []
    for p in (DC_PATH, VPN_PATH):
        try:
            with open(p) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    try:
                        net = ipaddress.ip_network(line, strict=False)
                    except ValueError:
                        continue
                    if net.version != 4:
                        continue
                    raw.append((int(net.network_address), int(net.broadcast_address)))
        except Exception:
            pass
    raw.sort()
    merged = []
    for st, en in raw:
        if merged and st <= merged[-1][1] + 1:
            if en > merged[-1][1]:
                merged[-1] = (merged[-1][0], en)
        else:
            merged.append((st, en))
    _dc_ranges = merged
    _dc_starts = [r[0] for r in merged]
    return _dc_starts, _dc_ranges


def is_datacenter(ip: str) -> bool:
    """True if IP is in a hosting/datacenter or VPN range (a bot, not a human)."""
    if ip in _dc_cache:
        return _dc_cache[ip]
    try:
        a = int(ipaddress.ip_address(ip))
    except ValueError:
        _dc_cache[ip] = False
        return False
    starts, ranges = _load_dc()
    i = bisect.bisect_right(starts, a) - 1
    res = i >= 0 and ranges[i][0] <= a <= ranges[i][1]
    _dc_cache[ip] = res
    return res


def classify_source(ip: str, ua: str, path: str, known_ips: dict) -> str:
    """you / internal / scanner / bot / slack / visitor (priority order)."""
    k = known_ips.get(ip, {})
    if k:
        return "you" if k.get("you") else "internal"
    if ip_in(ip, INTERNAL_NETS):
        return "internal"
    if ip_in(ip, SCANNER_NETS) or SCANNER_PATTERNS.search(path):
        return "scanner"
    ual = (ua or "").lower()
    if "slack" in ual or any(ip.startswith(p) for p in SLACK_IP_PREFIXES):
        return "slack"
    if not ua or ua == "-" or BOT_UA_RE.search(ua):
        return "bot"
    # Browser-UA traffic from hosting/datacenter/VPN ranges is a scraper, not a human.
    if is_datacenter(ip):
        return "bot"
    return "visitor"


def parse_ts(s: str):
    try:
        return dt.datetime.strptime(s, "%d/%b/%Y:%H:%M:%S %z")
    except Exception:
        return None


def iter_lines(path: Path):
    opener = gzip.open if str(path).endswith(".gz") else open
    try:
        with opener(path, "rt", errors="replace") as f:
            for line in f:
                yield line.rstrip("\n")
    except Exception as e:
        print(f"  warn: {path.name}: {e}", file=sys.stderr)


def parse_logs(known_ips: dict):
    now = dt.datetime.now(dt.timezone.utc)
    cutoff_24h = now - dt.timedelta(hours=24)
    cutoff_7d = now - dt.timedelta(days=7)

    def blank():
        return {
            "total_24h": 0, "total_7d": 0,
            "ips_24h": set(), "ips_7d": set(),
            "visitor_ips_24h": set(), "visitor_ips_7d": set(),
            "by_source_24h": Counter(), "vip_city": {},
            "status_4xx_24h": 0, "status_5xx_24h": 0, "bytes_24h": 0,
            "last_ts": None, "last_visitor_ts": None,
            "recent": [], "recent_visitors": [],
        }
    per_host = defaultdict(blank)

    # Deferred visitor rows so we can apply the cross-site crawler heuristic
    # (a visitor IP touching >=4 distinct hosts in 24h is a crawler, not a human).
    vrows = []                       # (host, ip, ts, status, size, is24, rec)
    vip_hosts_24h = defaultdict(set)
    global_vis_ips = set()
    global_ip_city = {}

    files = [LOG_DIR / "access.log", LOG_DIR / "access.log.1"]
    for n in range(2, 8):
        files.append(LOG_DIR / f"access.log.{n}.gz")
    files = [f for f in files if f.exists()]

    parse_ok = parse_skip = 0
    for f in files:
        for line in iter_lines(f):
            m = LINE_RE.match(line)
            if not m:
                parse_skip += 1
                continue
            parse_ok += 1
            ts = parse_ts(m.group("ts"))
            if ts is None or ts < cutoff_7d:
                continue
            host = m.group("host")
            if is_noise_host(host):
                continue
            ip = m.group("ip")
            status = int(m.group("status"))
            size = int(m.group("size"))
            method = m.group("method")
            path = m.group("path")
            ua = m.group("ua")
            src = classify_source(ip, ua, path, known_ips)
            ip_label = known_ips.get(ip, {}).get("label", "")
            is24 = ts >= cutoff_24h

            e = per_host[host]
            e["total_7d"] += 1
            e["ips_7d"].add(ip)

            rec = {
                "ts": ts.isoformat(), "ip": ip, "ip_label": ip_label,
                "source": src, "method": method, "path": path[:120],
                "status": status, "ua_short": ua[:60], "city": None,
            }

            if src == "visitor":
                # Defer: counted only after crawler detection.
                e["visitor_ips_7d"].add(ip)
                if is24:
                    vip_hosts_24h[ip].add(host)
                vrows.append((host, ip, ts, status, size, is24, rec))
                continue

            # Non-visitor sources counted immediately.
            if is24:
                e["total_24h"] += 1
                e["ips_24h"].add(ip)
                e["bytes_24h"] += size
                e["by_source_24h"][src] += 1
                if 400 <= status < 500:
                    e["status_4xx_24h"] += 1
                elif status >= 500:
                    e["status_5xx_24h"] += 1
                if e["last_ts"] is None or ts > e["last_ts"]:
                    e["last_ts"] = ts
                if src == "slack":
                    rec["city"] = geo_city(ip)
                    if e["last_visitor_ts"] is None or ts > e["last_visitor_ts"]:
                        e["last_visitor_ts"] = ts
                e["recent"].append(rec)
                if src == "slack":
                    e["recent_visitors"].append(rec)

    # Crawler heuristic: an IP that visits 4+ distinct hosts is a bot.
    crawler_ips = {ip for ip, hosts in vip_hosts_24h.items() if len(hosts) >= 4}

    for host, ip, ts, status, size, is24, rec in vrows:
        e = per_host[host]
        crawler = ip in crawler_ips
        src = "bot" if crawler else "visitor"
        rec["source"] = src
        if not crawler:
            rec["city"] = geo_city(ip)
        if is24:
            e["total_24h"] += 1
            e["ips_24h"].add(ip)
            e["bytes_24h"] += size
            e["by_source_24h"][src] += 1
            if 400 <= status < 500:
                e["status_4xx_24h"] += 1
            elif status >= 500:
                e["status_5xx_24h"] += 1
            if e["last_ts"] is None or ts > e["last_ts"]:
                e["last_ts"] = ts
            if not crawler:
                e["visitor_ips_24h"].add(ip)
                global_vis_ips.add(ip)
                if rec["city"]:
                    e["vip_city"].setdefault(ip, rec["city"])
                    global_ip_city.setdefault(ip, rec["city"])
                if e["last_visitor_ts"] is None or ts > e["last_visitor_ts"]:
                    e["last_visitor_ts"] = ts
            e["recent"].append(rec)
            if not crawler:
                e["recent_visitors"].append(rec)

    out = {}
    for host, e in per_host.items():
        # recent lists were appended out of order (non-visitor first, then visitor); sort by ts.
        e["recent"].sort(key=lambda r: r["ts"])
        e["recent_visitors"].sort(key=lambda r: r["ts"])
        out[host] = {
            "total_24h": e["total_24h"], "total_7d": e["total_7d"],
            "unique_ips_24h": len(e["ips_24h"]), "unique_ips_7d": len(e["ips_7d"]),
            "visitors_24h": e["by_source_24h"].get("visitor", 0),
            "unique_visitors_24h": len(e["visitor_ips_24h"]),
            "unique_visitors_7d": len(e["visitor_ips_7d"]),
            "by_source_24h": dict(e["by_source_24h"]),
            "top_cities": Counter(e["vip_city"].values()).most_common(8),
            "status_4xx_24h": e["status_4xx_24h"], "status_5xx_24h": e["status_5xx_24h"],
            "bytes_24h": e["bytes_24h"],
            "last_ts": e["last_ts"].isoformat() if e["last_ts"] else None,
            "last_visitor_ts": e["last_visitor_ts"].isoformat() if e["last_visitor_ts"] else None,
            "recent": e["recent"][-30:], "recent_visitors": e["recent_visitors"][-30:],
            "crawler_ips_seen": sum(1 for ip in crawler_ips if ip in e["ips_24h"]) if False else None,
        }
    return out, parse_ok, parse_skip, global_vis_ips, global_ip_city


def list_deployed_sites() -> list:
    sites = []
    for d in SITES_ROOT.iterdir():
        if not d.is_dir() or d.name.startswith(("_", ".")):
            continue
        try:
            mtime = dt.datetime.fromtimestamp(d.stat().st_mtime, dt.timezone.utc).isoformat()
        except Exception:
            mtime = None
        url = f"https://{d.name}.georg.miami"
        try:
            r = subprocess.run(["curl", "-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "3", url],
                               capture_output=True, text=True, timeout=5)
            http = int(r.stdout.strip() or 0)
        except Exception:
            http = 0
        sites.append({"name": d.name, "url": url, "mtime": mtime, "http": http})
    return sites


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    known = load_known_ips()
    geo_status = "on" if _geo() else "off"
    print(f"sites-stats v3: parsing logs (known IPs: {len(known)}, geo: {geo_status})")
    stats, ok, skip, gvis, gip_city = parse_logs(known)
    print(f"  parsed {ok} lines, skipped {skip}")
    sites = list_deployed_sites()
    print(f"  {len(sites)} site directories")

    totals = {
        "requests_24h": sum(s["total_24h"] for s in stats.values()),
        "visitors_24h": sum(s["visitors_24h"] for s in stats.values()),
        "unique_visitors_24h": sum(s["unique_visitors_24h"] for s in stats.values()),
        "unique_people_24h": len(gvis),
        "top_cities_24h": Counter(gip_city.values()).most_common(10),
        "sites_with_visitors_24h": sum(1 for s in stats.values() if s["visitors_24h"] > 0),
        "unique_sites_24h": sum(1 for s in stats.values() if s["total_24h"] > 0),
        "total_sites": len(sites),
        "by_source_24h": Counter(),
        "status_4xx_24h": sum(s["status_4xx_24h"] for s in stats.values()),
        "status_5xx_24h": sum(s["status_5xx_24h"] for s in stats.values()),
    }
    for s in stats.values():
        for k, v in s["by_source_24h"].items():
            totals["by_source_24h"][k] += v
    totals["by_source_24h"] = dict(totals["by_source_24h"])

    out = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "schema": "v3-human-filtered",
        "geo": geo_status,
        "stats_by_host": stats, "sites": sites, "totals": totals, "known_ips": known,
        "source_legend": {
            "you":      {"emoji": "🏠", "name": "You",      "desc": "Your labeled IPs (home, mac mini, phone)"},
            "internal": {"emoji": "🤖", "name": "Internal", "desc": "VPS-to-VPS, localhost, Tailscale, private networks"},
            "scanner":  {"emoji": "🕷️", "name": "Scanner",  "desc": "Vuln scanners probing /wp-admin, /.env, etc"},
            "bot":      {"emoji": "🛰️", "name": "Bot",      "desc": "Crawlers, AI bots, uptime monitors, curl/python, and datacenter/VPN scrapers (NOT humans)"},
            "slack":    {"emoji": "💬", "name": "Slack",    "desc": "Slack link-unfurl crawler"},
            "visitor":  {"emoji": "🌐", "name": "Visitor",  "desc": "Plausible real human (the only bucket that counts as traffic)"},
        },
        "status_legend": {
            "2xx": "Success", "3xx": "Redirect", "4xx": "Client error", "5xx": "Server error",
        },
    }
    try:
        with open('/var/www/sites/sites/catalog.json') as f:
            out['catalog'] = json.load(f).get('sites', {})
    except Exception:
        out['catalog'] = {}

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    os.chmod(OUT, 0o644)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
    print(f"  humans 24h: {totals['visitors_24h']} hits / {totals['unique_visitors_24h']} unique across {totals['sites_with_visitors_24h']} sites")
    print(f"  by source: {totals['by_source_24h']}")


if __name__ == "__main__":
    main()
