#!/bin/bash
# Daily Git Activity Digest. Runs 7 AM daily.
# Scans git log across ALL repos under ~/Desktop/Coding/ for commits in last 24h,
# posts a single consolidated digest to #drift so Hermes sees what changed yesterday
# (catches everything you did, even in sessions that never closed).
set -u

LOG="$HOME/.claude/logs/daily-git-digest.log"
mkdir -p "$(dirname "$LOG")"
TS=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== DAILY DIGEST: $TS =====" >> "$LOG"

CODING="$HOME/Desktop/Coding"
SINCE="24 hours ago"
TOTAL_COMMITS=0
SUMMARY=""

# Find every git repo within Coding/ (max depth 3 so we don't recurse forever)
while IFS= read -r gitdir; do
  repo_dir="$(dirname "$gitdir")"
  rel="${repo_dir#$CODING/}"

  # Skip pwc/, _backup, _archive
  case "$rel" in
    pwc/*|pwc|_backup/*|_archive/*) continue ;;
  esac

  # Get commits in last 24h
  commits=$(cd "$repo_dir" 2>/dev/null && git log --since="$SINCE" --format="%h %s" 2>/dev/null)
  if [ -n "$commits" ]; then
    count=$(echo "$commits" | wc -l | tr -d ' ')
    TOTAL_COMMITS=$((TOTAL_COMMITS + count))
    # Format: "  • repo (N): commit list"
    indented=$(echo "$commits" | sed 's/^/    • /')
    SUMMARY+="\n*$rel* ($count commit$([ "$count" != "1" ] && echo s)):\n$indented\n"
  fi
done < <(find "$CODING" -maxdepth 4 -name ".git" -type d 2>/dev/null)

# --- Traffic: real humans on the sites (bots, scanners, internal, and Georg's
#     own machines excluded). Computed on the VPS from human-filtered stats.json. ---
TRAFFIC=$(ssh -o ConnectTimeout=6 -o BatchMode=yes root@159.89.185.96 'python3 /usr/local/bin/traffic-digest.py' 2>>"$LOG")
[ -z "$TRAFFIC" ] && TRAFFIC=":bar_chart: *Traffic* unavailable (VPS unreachable this run)"

# --- Compose (traffic always posts; commits only when there were any) ---
if [ "$TOTAL_COMMITS" -gt 0 ]; then
  HEAD_BLOCK=":sunrise: *Yesterday's activity* · $TOTAL_COMMITS commit$([ "$TOTAL_COMMITS" != "1" ] && echo s) across local repos
$(echo -e "$SUMMARY")"
else
  HEAD_BLOCK=":sunrise: *Morning digest* · no commits in the last 24h"
fi

MSG="$HEAD_BLOCK

$TRAFFIC"

# Post to #drift
if [ -x "$HOME/.claude/scripts/slack-post.sh" ]; then
  "$HOME/.claude/scripts/slack-post.sh" drift "$MSG" 2>>"$LOG"
  echo "  POSTED digest: $TOTAL_COMMITS commits + traffic block" >> "$LOG"
fi
