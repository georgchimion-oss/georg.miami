#!/usr/bin/env python3
# Prints a Slack-ready "real humans only" traffic block from stats.json (v3, human-filtered).
# Used by the 7am morning digest. Bots, scanners, internal, and Georg's own machines excluded.
import json, sys

STATS = "/var/www/sites/sites/stats.json"

def short(host):
    return host[:-len(".georg.miami")] if host.endswith(".georg.miami") else host

try:
    d = json.load(open(STATS))
except Exception as e:
    print(":bar_chart: *Traffic* unavailable (stats.json: %s)" % e); sys.exit(0)

t = d.get("totals", {})

# REAL humans = only the "visitor" bucket (bots, internal, you, scanners all excluded)
real_visitor_hits = t.get("by_source_24h", {}).get("visitor", 0)
pageviews = t.get("pageviews_24h", 0)

# Get actual unique real-human IPs: intersection of visitor_ips_24h across all sites
unique_real_humans = 0
for host, stats in d.get("stats_by_host", {}).items():
    unique_real_humans += stats.get("unique_visitors_24h", 0)

# Aggregate hosts with visitor activity
hosts = []
for h, s in d.get("stats_by_host", {}).items():
    uv = s.get("unique_visitors_24h", 0); v = s.get("visitors_24h", 0)
    if uv > 0:
        hosts.append((uv, v, short(h)))
hosts.sort(reverse=True)
nsites = len(hosts)

if unique_real_humans == 0 and not hosts:
    print(":bar_chart: *Traffic* (24h): no real human visitors.")
    sys.exit(0)

# per-site line (top 8)
parts = ["%s *%d*" % (name, uv) for uv, v, name in hosts[:8]]
more = nsites - 8
site_line = " · ".join(parts) + (((" · +%d more" % more) if more > 0 else ""))

cities = [c.split(",")[0] for c, n in t.get("top_cities_24h", [])][:4]
city_line = ", ".join(cities) if cities else "unknown"

# Source breakdown
sources = t.get("traffic_sources_7d", {})
source_items = []
if sources.get("google", 0) > 0:
    source_items.append(":mag: Google %d" % sources["google"])
if sources.get("direct", 0) > 0:
    source_items.append(":arrow_right_hook: Direct %d" % sources["direct"])
if sources.get("internal-nav", 0) > 0:
    source_items.append(":link: Internal %d" % sources["internal-nav"])
source_line = ", ".join(source_items) if source_items else "unknown"

# Top pages
top_pages = []
for host, s in sorted(d.get("stats_by_host", {}).items()):
    top_pages.extend(s.get("pages_7d", {}).items())
if top_pages:
    from collections import Counter
    page_counts = Counter(dict(top_pages))
    top_page_line = ", ".join(["%s (%d)" % (p, c) for p, c in page_counts.most_common(3)])
else:
    top_page_line = "none"

lines = [
    ":bar_chart: *Morning brief -- real human visits* (your machines, bots, and scanners excluded)",
    "*Yesterday:* %d people, %d page views" % (unique_real_humans, pageviews),
    "*Leads (24h):* %d total (%d contact, %d audit)" % (t.get("leads", {}).get("contact_24h", 0) + t.get("leads", {}).get("audit_24h", 0), t.get("leads", {}).get("contact_24h", 0), t.get("leads", {}).get("audit_24h", 0)),
    "*Sites people visited (24h):* %s" % site_line,
    "*Where they come from (7d):* %s" % source_line,
    "*From search engines (7d):* %d" % sources.get("google", 0),
    "*Top pages on georg.miami (7d):* %s" % top_page_line,
]
print("\n".join(lines))
