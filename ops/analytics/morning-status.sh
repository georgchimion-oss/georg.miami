#!/bin/bash
# Morning status (7am, Mini -> Slack #drift): visitors, health/problems, sync, next steps.
set -u
LOG="$HOME/.claude/logs/morning-status.log"; mkdir -p "$(dirname "$LOG")"
CODING="$HOME/Coding"; VPS="root@159.89.185.96"
TODAY=$(date "+%a %b %d")
echo "===== MORNING STATUS $(date) =====" >> "$LOG"
vps(){ ssh -o ConnectTimeout=8 -o BatchMode=yes "$VPS" "$@" 2>>"$LOG"; }

# 1) VISITORS yesterday (retry transient SSH reset)
TRAFFIC=""
for i in 1 2 3; do TRAFFIC=$(vps 'python3 /usr/local/bin/traffic-digest.py'); [ -n "$TRAFFIC" ] && break; sleep 5; done
[ -z "$TRAFFIC" ] && TRAFFIC="  :bar_chart: traffic unavailable (VPS unreachable)"

# 2) HEALTH / problems
VH=$(vps 'python3 /usr/local/bin/status-vps.py')
APPS=$(printf '%s\n' "$VH" | sed -n 's/^apps=//p'); [ -z "$APPS" ] && APPS="unavailable"
SITES=$(printf '%s\n' "$VH" | sed -n 's/^sites=//p'); [ -z "$SITES" ] && SITES="unavailable"
JOBS=$(launchctl list | grep com.georg | awk '$2!=0 && $2!="-"{print $3" (exit "$2")"}' | tr '\n' ' ')
[ -z "$JOBS" ] && JOBS="all green"
CAN=$(grep -hoE "OK: [0-9]+ files match.*|ALERT.* [0-9]+ files" ~/.claude/logs/pwc-canary*.log 2>/dev/null | tail -1)
[ -z "$CAN" ] && CAN="n/a"

# 3) SYNC
if [ "$(vps 'echo ok')" = "ok" ]; then VPSOK="reachable"; else VPSOK=":warning: unreachable"; fi
REPO=$(cd "$CODING/portfolio/georg-ai" 2>/dev/null && git fetch -q origin 2>/dev/null
  L=$(git rev-parse --short HEAD 2>/dev/null); R=$(git rev-parse --short origin/main 2>/dev/null)
  if [ -n "$L" ] && [ "$L" = "$R" ]; then echo "georg.miami in sync ($L)"; else echo ":warning: georg.miami: local $L / remote $R"; fi)
PULLOK=$(tail -8 ~/coding-sync.log 2>/dev/null | grep -c "^OK")

# 4) NEXT UP (ROADMAP-grounded, best effort; fallback to pending proposals)
PEND=$(ls "$CODING"/_security/proposals/20*/*.md 2>/dev/null | wc -l | tr -d ' ')
# Next steps: real in-progress items from ROADMAP + proposals to review (no LLM, reliable)
INPROG=$(grep -iE "IN PROGRESS" "$CODING/ROADMAP.md" 2>/dev/null \
  | sed -E 's/^[[:space:]#*-]+//; s/[[:space:]]*[—-]+[[:space:]]*🔵?[[:space:]]*IN PROGRESS.*$//I; s/\*\*//g' \
  | cut -c1-90 | head -4 | sed 's/^/  • /')
[ -z "$INPROG" ] && INPROG="  • (nothing marked IN PROGRESS in ROADMAP)"
NEXT="$INPROG"
[ "$PEND" != "0" ] && NEXT="$NEXT
  • $PEND self-improvement proposal(s) to review (DM Hermes to apply)"

MSG=":sunny: *Morning status* · $TODAY

$TRAFFIC

:hospital: *Health*
  • VPS apps: $APPS
  • Sites: $SITES
  • Mini jobs: $JOBS
  • PwC canary: $CAN

:arrows_counterclockwise: *Sync*
  • VPS: $VPSOK
  • $REPO
  • Mini pulls OK (recent): $PULLOK

:white_check_mark: *Next up* ($PEND proposals pending)
$NEXT"

if [ -x "$HOME/.local/bin/slack-post.sh" ]; then "$HOME/.local/bin/slack-post.sh" drift "$MSG" 2>>"$LOG"; echo "posted" >> "$LOG"; fi
echo "$MSG"
