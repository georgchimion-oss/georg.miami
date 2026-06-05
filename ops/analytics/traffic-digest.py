#!/usr/bin/env python3
# Prints a Slack-ready "real humans" traffic block from stats.json (v3, human-filtered).
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
people = t.get("unique_people_24h", 0)
by = t.get("by_source_24h", {})
bots = by.get("bot", 0); scanners = by.get("scanner", 0)

hosts = []
for h, s in d.get("stats_by_host", {}).items():
    uv = s.get("unique_visitors_24h", 0); v = s.get("visitors_24h", 0)
    if uv > 0:
        hosts.append((uv, v, short(h)))
hosts.sort(reverse=True)
nsites = len(hosts)

if people == 0 and not hosts:
    print(":bar_chart: *Traffic* (24h): no real human visitors. %d bot + %d scanner hits filtered out." % (bots, scanners))
    sys.exit(0)

# per-site line (top 8)
parts = ["%s *%d*" % (name, uv) for uv, v, name in hosts[:8]]
more = nsites - 8
site_line = " · ".join(parts) + ((" · +%d more" % more) if more > 0 else "")

cities = [c.split(",")[0] for c, n in t.get("top_cities_24h", [])][:4]
city_line = ", ".join(cities) if cities else "unknown"

lines = [
    ":busts_in_silhouette: *Traffic* (real humans, last 24h)",
    "  • *%d people* across %d site%s (bots, scanners, your machines excluded)" % (people, nsites, "" if nsites == 1 else "s"),
    "  • %s" % site_line,
    "  • cities: %s" % city_line,
    "  • filtered out: %d bot + %d scanner hits" % (bots, scanners),
]
print("\n".join(lines))
