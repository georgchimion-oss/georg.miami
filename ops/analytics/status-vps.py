#!/usr/bin/env python3
# VPS-side health for the morning status: pm2 apps + site 5xx errors.
import json, subprocess
try:
    out = subprocess.run(["pm2","jlist"], capture_output=True, text=True, timeout=12).stdout
    j = json.loads(out)
    on = [x for x in j if x.get("pm2_env",{}).get("status")=="online"]
    bad = [x.get("name","?") for x in j if x.get("pm2_env",{}).get("status")!="online"]
    pm2 = f"{len(on)}/{len(j)} apps online" + ("" if not bad else " DOWN: " + ", ".join(bad))
except Exception:
    pm2 = "pm2 status unavailable"
try:
    d = json.load(open("/var/www/sites/sites/stats.json")); t = d["totals"]
    n5 = t.get("status_5xx_24h", 0)
    bad = [h for h,s in d["stats_by_host"].items() if s.get("status_5xx_24h",0) > 0]
    sites = t.get("total_sites", "?")
    errs = "no 5xx errors" if n5 == 0 else f"{n5} 5xx on " + ", ".join(bad[:4])
except Exception:
    sites, errs = "?", "stats unavailable"
print(f"apps={pm2}")
print(f"sites={sites} live, {errs}")
