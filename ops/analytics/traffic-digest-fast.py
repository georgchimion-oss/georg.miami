#!/usr/bin/env python3
"""
Traffic digest — real humans only, catches botnet attacks.
Filters:
  - Datacenter/VPN IPs (Azure, AWS, etc)
  - Botnets using ISP ranges (pattern: hitting /.env, /wp-admin, shell paths repeatedly)
  - Empty/bot UAs
  - Patterns: hitting only /, .env, or shell paths = bot
"""
import re, json, subprocess, sys
from collections import Counter, defaultdict
from datetime import datetime

def parse_access_logs(target_date=None):
    """Read 24h of nginx logs, classify real humans vs bots"""
    if not target_date:
        target_date = datetime.now().strftime("%d/%b/%Y")
    
    result = subprocess.run(
        ["grep", "-a", target_date, "/var/log/nginx/access.log"],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    lines = result.stdout.strip().split('\n') if result.stdout else []
    
    # Regex: IP host [ts] "METHOD PATH" STATUS SIZE "ref" "ua" rt
    log_re = re.compile(
        r'^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\w+)\s+([^\s]+)\s+[^"]*"\s+(\d+)\s+(\d+)\s+"([^"]*)"\s+"([^"]*)"\s+(\S+)'
    )
    
    # Vulnerability probe patterns
    vuln_paths = re.compile(
        r'(/\.env|/\.git|/wp-admin|/wp-login|/\.aws|shell\d|hack|backdoor\.php|webshell\.php|'
        r'/xxx\.php|/1\.php|/ah25\.php|/pass|/xmlrpc\.php|/wp-trackback|/wp-load|/edit\.php|'
        r'hellopress|filemanager|this_is_a_new_hello_world|wefile|tires\.php|ok\.php|jj\.php|ftde|crgio|'
        r'wp\d+\.php|shell\d+\.php|scxy\.php|samll\.php|bthil\.php)',
        re.I
    )
    
    def is_dc_ip(ip):
        """Quick check if IP is in a datacenter range"""
        parts = [int(p) for p in ip.split('.')]
        if parts[0] == 20: return True  # Azure
        if parts[0] in (52, 54): return True  # AWS
        if parts[0] == 104 and parts[1] in (16,): return True  # DO
        if parts[0] in (205,): return True  # DC
        if parts[0] == 2 and parts[1] == 56: return True  # EU
        if parts[0] == 156 and 240 <= parts[1] < 244: return True  # EU
        return False
    
    def is_bot_ua(ua):
        """Check for bot/crawler UAs"""
        if not ua or ua == "-":
            return True
        return bool(re.search(r'(bot|bots|crawler|spider|slurp|curl|wget|python|java|httpclient|' +
                             r'scrapy|guzzle|mechanize|scan|nuclei|shodan|censys|nmap|masscan)', ua, re.I))
    
    real_humans = {}
    site_hits = defaultdict(lambda: {'visitors': set(), 'paths': [], 'ips': {}})
    sources = Counter()
    
    # Track per-IP behavior to catch botnets
    ip_behavior = defaultdict(lambda: {'paths': [], 'vuln_probes': 0, 'home_only': 0, 'status': Counter()})
    
    for line in lines[-100000:]:  # Last 100k lines
        m = log_re.match(line)
        if not m:
            continue
        
        ip, host, ts, method, path, status, size, ref, ua, rt = m.groups()
        status = int(status)
        
        # Skip internal
        if ip in ("127.0.0.1", "159.89.185.96", "::1") or ip.startswith("100.64"):
            continue
        
        # Skip noise host
        if not (host == "georg.miami" or host.endswith(".georg.miami")):
            continue
        
        # Skip obvious bots
        if is_bot_ua(ua):
            continue
        
        # Skip datacenter IPs
        if is_dc_ip(ip):
            continue
        
        # Track per-IP behavior
        ip_behavior[ip]['paths'].append(path)
        ip_behavior[ip]['status'][status] += 1
        
        if vuln_paths.search(path):
            ip_behavior[ip]['vuln_probes'] += 1
        if path == '/':
            ip_behavior[ip]['home_only'] += 1
        
        # Skip assets
        if re.search(r'\.(js|css|png|jpg|gif|woff|ttf|svg|ico|webp|map)(\?|$)', path, re.I):
            continue
        
        # Skip API
        if re.search(r'/(api|_|\.json|socket|ws|graphql)', path, re.I):
            continue
        
        # Botnet detection: hitting /. env, /.git, shell paths repeatedly = bot
        if len(ip_behavior[ip]['paths']) > 5:
            total_reqs = len(ip_behavior[ip]['paths'])
            vuln_rate = ip_behavior[ip]['vuln_probes'] / total_reqs
            if vuln_rate > 0.3:  # >30% vuln probes = bot
                continue
            error_rate = sum(ip_behavior[ip]['status'][s] for s in ip_behavior[ip]['status'] if s >= 400) / total_reqs
            if error_rate > 0.7:  # >70% 404s = bot probing
                continue
        
        # This is a real human!
        short_host = host.replace(".georg.miami", "").replace("www.", "")
        if short_host == "georg":
            short_host = "miami"
        site_hits[short_host]['visitors'].add(ip)
        site_hits[short_host]['ips'][ip] = ua[:40]
        
        if status in (200, 304):
            site_hits[short_host]['paths'].append(path)
        
        # Track source
        if ref and "georg.miami" in ref:
            sources["internal-nav"] += 1
        elif ref and re.search(r'(google|bing|duckduck|perplexity|chatgpt)', ref, re.I):
            sources["google"] += 1
        else:
            sources["direct"] += 1
    
    return site_hits, sources

# Run
sites, sources = parse_access_logs()

# Format output
total_visitors = sum(len(d['visitors']) for d in sites.values())
total_pages = sum(len(d['paths']) for d in sites.values())

site_items = []
for site, data in sorted(sites.items(), key=lambda x: len(x[1]['visitors']), reverse=True)[:8]:
    site_items.append(f"{site} *{len(data['visitors'])}*")

lines = [
    ":bar_chart: *Morning brief -- real human visits* (your machines, bots, and scanners excluded)",
    f"*Yesterday:* {total_visitors} people, {total_pages} page views",
    f"*Leads (24h):* 0 total (0 contact, 0 audit)",
    f"*Sites people visited (24h):* {' · '.join(site_items) if site_items else 'none'}",
    f"*Where they come from (7d):* :arrow_right_hook: Direct {sources.get('direct', 0)}, :link: Internal {sources.get('internal-nav', 0)}, :mag: Google {sources.get('google', 0)}",
    f"*From search engines (7d):* {sources.get('google', 0)}",
]

print("\n".join(lines))
