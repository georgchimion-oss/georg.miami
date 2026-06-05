# georg.miami traffic analytics (human-filtered)

Answers one question honestly: **how many real people visited which site**, with bots,
scanners, internal/VPS traffic, and Georg's own machines excluded. Drives the 7am Slack
digest and the sites.georg.miami dashboard.

These are the canonical copies. The live versions run on the VPS (159.89.185.96) at the
paths below. Edit here, then scp to the VPS path, or edit on the VPS and pull back here.

## What runs where

| File (repo) | Live path (VPS) | Role |
|---|---|---|
| `sites-stats.py` | `/usr/local/bin/sites-stats.py` | Parses nginx logs every 2 min (cron), writes `/var/www/sites/sites/stats.json`. Classifies every request and only counts real humans as `visitor`. |
| `traffic-digest.py` | `/usr/local/bin/traffic-digest.py` | Reads stats.json, prints the Slack "real humans" block. |
| `sites-dashboard.html` | `/var/www/sites/sites/index.html` | sites.georg.miami dashboard (Catalog + Traffic tabs). |
| `known-ips.json` | `/var/www/sites/sites/known-ips.json` | IP -> {label, you} map. `you:true` IPs are excluded as "you". Add networks via /whoami.html. |
| `daily-git-digest.sh` | `~/.claude/scripts/daily-git-digest.sh` (MacBook) | 7am launchd job (`com.georg.daily-git-digest`). Posts commits + traffic block to Slack #drift. SSHes to the VPS to run traffic-digest.py. |

Cron on the VPS (every 2 min): `site-catalog.py && sites-stats.py`.

## Classification (sites-stats.py, priority order)

1. **you** / **internal** — IP in known-ips.json (`you` true/false).
2. **internal** — private / Tailscale (100.64/10) / loopback CIDR.
3. **scanner** — known scanner IP range, or a vuln-probe path (/wp-admin, /.env, ...).
4. **bot** — User-Agent matches a crawler/AI-bot/uptime-monitor/automation signature, or UA empty,
   or the IP is in a hosting/datacenter/VPN range (db-ip + X4BNet lists), or the IP hit 4+ distinct
   sites in 24h (cross-site crawler heuristic).
5. **slack** — Slack link-unfurl UA / IP.
6. **visitor** — a plausible real human. The only bucket counted as traffic.

Only `*.georg.miami` Host headers are counted. Foreign Host headers (parked domains, spoofed
scanner Hosts) are dropped.

## Geo (offline, no SaaS)

- `/var/www/sites/sites/geo/dbip-city-lite.mmdb` — db-ip City Lite (free, no license key). City/country for visitor IPs.
- `/var/www/sites/sites/geo/datacenter.txt`, `vpn.txt` — X4BNet hosting/VPN CIDR lists. Visitors from these ranges are reclassified as bots.
- Reader: `maxminddb` (pip, installed with --break-system-packages).
- Refresh monthly: re-download dbip-city-lite-YYYY-MM.mmdb.gz and the X4BNet lists.

## Known residual

Offline filtering cannot catch every bot. A small tail of proxy/VPN scrapers using real browser
User-Agents from IP ranges not on the lists may still count as visitors. Cities are counted by
unique IP (one vote per IP), so a single hammering bot no longer dominates. To tighten: label more
IPs in known-ips.json, or refresh the datacenter/VPN lists.
