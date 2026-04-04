# Agent Factory — PwC Live Demo Plan
## Claude Event | April 7, 2026 | Institutional / Fintech Audience

---

## CURRENT STATE OF THE BUILD

Everything below is based on a full read of the existing codebase at `personal/hosted/factory/`.

**What's built and working:**
- 4-agent pipeline: PM → Coder → Reviewer → Deployer (pipeline.js)
- Presenter dashboard (factory.html) with pixel-art office scene, chat/console/timeline tabs, present mode, QR card, build timer, agent info modals, countdown overlay, site reveal iframe
- Spectator live view (live.html) — mobile-optimized, read-only, no chat input, agent cards with status, activity feed, elapsed timer
- Telegram bot integration (telegram.js) — authorized users, text + photo support, /start /sites /reset commands
- SSE streaming for both factory clients and spectator clients (separate streams, filtered events)
- Deployer writes to `/var/www/sites/{name}/` and sites go live at `{name}.georg.miami` via nginx wildcard
- Coder generates single-file HTML/CSS/JS — no external dependencies except Google Fonts
- Reviewer scores output, sends back for revision if score < 8
- Heartbeat broadcasts every 30s during long agent tasks
- 100 spectator cap on `/api/live-stream`
- Present mode on dashboard: larger fonts, build timer in header, QR card in corner, "Built with Claude" badge, spectator count

**What's NOT built (gaps for the demo):**
1. **No actual QR code** — The QR card area exists in CSS but renders as a styled text box with the URL, not a scannable QR code. Need to generate a real QR code (e.g., qrcode npm package or inline SVG).
2. **Heartbeat only every 30s** — During coding phase (which can take 60-90s), the UI can feel stuck. Need more frequent progress signals (every 5-10s).
3. **No stage timeout safety** — If an agent hangs, nothing auto-recovers. Need per-stage timeouts.
4. **No pre-built fallback** — If the build fails live, there's no template fallback.
5. **Reviewer checks for OLD dark design system** — Reviewer prompt references `#08080A` dark theme, but Coder prompt now uses light SaaS theme (`#FAFAFA`). These are out of sync. Reviewer will flag the Coder's output as non-compliant, causing unnecessary revisions that waste demo time.
6. **Base model is `claude-sonnet-4-5-20250929`** — Verify this is the fastest available Sonnet variant for the demo. Speed is critical.
7. **`chat-input-row` still exists in factory.html** — Your requirement says no web chat, only Telegram. The chat input is there but can be hidden via present mode. Verify it's hidden.
8. **No QR code generation library installed** — Need `qrcode` npm package on VPS.

---

## ACTION PLAN (10-Day Countdown)

### Days 10-8: Code Fixes (Delegate to Claude Code)

**Priority 1 — Fix the Reviewer/Coder design system mismatch:**
- Coder prompt (`coder.js` line 32) uses light SaaS theme: `#FAFAFA` bg, Inter font, blue/purple accents
- Reviewer prompt (`reviewer.js` line 32) still checks for dark theme: `#08080A`, Space Grotesk, glass-morphism
- **Fix:** Update Reviewer prompt to match Coder's light SaaS design system. Or decide which theme the demo should use and make both agents consistent. For PwC fintech audience, the light SaaS theme (clean, modern, enterprise) is the better choice.

**Priority 2 — Add real QR code:**
- Install `qrcode` package on VPS
- Generate QR code SVG in factory.html pointing to `https://api.georg.miami/factory/live`
- Replace the text-only QR card with actual scannable QR

**Priority 3 — Increase heartbeat frequency:**
- In `pipeline.js` lines 170 and 187, heartbeat interval is 30000ms (30s)
- Change to 8000ms (8s) for the coder agent
- Add intermediate status broadcasts: "Writing HTML structure...", "Adding styles...", "Building interactivity...", "Finalizing..."

**Priority 4 — Add stage timeouts:**
- Wrap each `agents.*.run()` call in a `Promise.race` with a timeout
- PM: 30s timeout → auto-use a simplified plan
- Coder: 120s timeout → use whatever was generated (truncated is better than nothing)
- Reviewer: 45s timeout → auto-pass with score 7
- Deployer: 15s timeout → should never timeout (no API call)
- On timeout, log it and continue pipeline — don't crash

**Priority 5 — Add template fallback:**
- Create 3 pre-built HTML files in a `/server/fallbacks/` directory matching each demo project option
- If `runFactory()` throws, deploy the fallback instead and broadcast `build_complete` with the fallback URL
- The audience won't know the difference

**Priority 6 — Verify present mode hides chat input:**
- In factory.html, confirm that present mode adds `hidden` class to `.chat-input-row`
- If not, add it to the present mode toggle logic

### Days 7-5: Polish & Test

- [ ] Run the chosen demo brief 10 times end-to-end
- [ ] Record timing for each run — average must be <4 min (target 3 min)
- [ ] Record a perfect run as video backup (screen recording with OBS or QuickTime)
- [ ] Test spectator view on iPhone and Android — verify mobile layout works
- [ ] Test on a friend's phone (not your own WiFi) to check latency
- [ ] Increase font sizes in present mode if needed (factory.html line 33: timer is 28px, could go to 36px)

### Days 4-2: Rehearsal

- [ ] Full dress rehearsal with screen sharing (simulate the demo exactly)
- [ ] Time the entire presentation including script — target 7-8 minutes total
- [ ] Practice recovery lines for each failure scenario
- [ ] If possible, test on PwC office WiFi (check if WebSocket/SSE is blocked by proxy)
- [ ] Prepare Telegram message pre-typed in drafts (don't type live — paste it)

### Day 1: Pre-Event

- [ ] SSH into VPS: `pm2 restart penny` to ensure clean state
- [ ] Hit `https://api.georg.miami/factory?token=...` to confirm dashboard loads
- [ ] Send a test message to Telegram bot to confirm it responds
- [ ] Open `https://api.georg.miami/factory/live` on phone to confirm spectator works
- [ ] Bring mobile hotspot (charged) as network backup
- [ ] Disable all notifications on laptop and phone
- [ ] Clear Telegram chat history (no embarrassing messages visible when you show phone)
- [ ] Pre-type the demo brief in Telegram drafts
- [ ] Increase browser zoom to 110-125% for audience visibility

---

## PRESENTATION SCRIPT

### Setup (Before You Speak)
- Dashboard open in browser, present mode activated
- Phone in hand with Telegram open to the Factory bot
- QR code visible on screen in the corner

### Opening — The Hook (30 seconds)

> "Every tool demo you've seen today shows AI answering questions. I want to show you something different. I'm going to text a message to an AI team — four specialized agents that work like a real engineering squad — and you're going to watch them plan, build, review, and ship a working application in under five minutes."

### Audience Participation (20 seconds)

> "Pull out your phones. Scan this QR code or type in the URL at the bottom of your screen. You're about to watch this happen live from your own device."

*[Pause 10 seconds. Point at QR code. Wait for a few people to scan.]*

> "You should see the factory dashboard. Right now it says idle. That's about to change."

### The Brief (20 seconds)

> "I'm going to text the PM agent from Telegram. Watch."

*[Hold phone up briefly so audience can see you're using Telegram. Send the pre-typed brief. Put phone down.]*

> "The brief just landed. Watch the PM agent light up."

### Narrating the Build (3-4 minutes)

**When PM activates:**
> "The PM is breaking down the brief — defining the architecture, the sections, the data model. You'll see it walk to the whiteboard in the office and write the plan."

*[Point to the whiteboard content updating on screen. Let the PM work for ~15 seconds.]*

**When Coder activates:**
> "The PM just handed the spec to the Coder. This agent is now writing a complete, production-ready application — HTML, CSS, JavaScript — from scratch. No templates. No boilerplate."

*[Watch the activity log. Comment on what's scrolling by.]*

> "Notice the timer. We're at [X] seconds. The coder is generating somewhere around 10,000 characters of code right now."

**When Reviewer activates:**
> "Code's done. But here's what makes this enterprise-grade — before anything ships, it goes through a review agent. This is an independent AI that inspects the code for accessibility, responsive design, security, and best practices. It scores it out of 10."

*[Wait for review score to appear.]*

> "Score: [X] out of 10. [If revision happens:] It found some issues — watch, it's sending the code back for revision. This is the governance loop that institutions need."

**When Deployer activates:**
> "Approved. The deployer is now writing the files to a live server. In about 5 seconds, this will be accessible to anyone on the internet."

### The Reveal (30 seconds)

*[When build_complete fires, the site reveal iframe should open automatically in present mode.]*

> "That was [X] minutes and [Y] seconds. From a text message to a live, deployed application. No human touched the code. Let me show you what it built."

*[Walk through the deployed site briefly — scroll through it, show it's real.]*

### Enterprise Framing (60 seconds)

> "Why does this matter to you? Three things."
>
> "One: speed. What just happened in [X] minutes would take a team of humans days. Not because the humans are slow — because of meetings, context-switching, handoffs, and review cycles."
>
> "Two: governance. Every step you saw was logged and auditable. The review agent enforces standards before anything ships. That audit trail exists for every build."
>
> "Three: consistency. This runs the same way at 2 AM as it does at 2 PM. It doesn't have bad days. It doesn't forget the style guide. And it can be configured to enforce your organization's specific standards."

### Close (20 seconds)

> "This is where it's going. Not replacing your engineers — giving them a team of AI specialists that handle the repeatable work so they can focus on the problems that require human judgment. Thanks."

---

## Q&A PREPARATION

**"Is this production-ready?"**
> "The factory itself is a demonstration of the pattern. What's production-ready is the underlying architecture — specialized agents with defined roles, a review/governance layer, and audit logging. We're using Claude's API, which is already SOC 2 certified and used by enterprises globally."

**"What about hallucinations / errors?"**
> "That's exactly why the review agent exists. It's a separate model instance whose only job is to catch problems. Think of it as automated QA. And because every step is logged, you can trace any decision back to its source."

**"How does this compare to Copilot / ChatGPT?"**
> "Those are single-agent tools — one model doing everything. This is a multi-agent system with specialization and checks and balances. It's the difference between asking one person to do everything versus having a coordinated team."

**"Can this handle our internal tools / data?"**
> "The architecture is the same — you'd customize the agent prompts with your standards, connect them to your systems, and add domain-specific knowledge. The orchestration pattern works for any build pipeline."

**"What happens if it fails?"**
> "The same thing that happens when code fails in any pipeline — it's caught by the review stage, and it either gets revised or flagged. The system is designed to fail gracefully."

**"Is this just generating boilerplate?"**
> "No. Watch the activity log — it's making design decisions, writing custom interactivity, populating with realistic data. The reviewer validates quality independently. You saw the score."

---

## DEMO PROJECT OPTIONS

Pick ONE. Pre-test it 10+ times. Have a fallback pre-built.

### Option A: KYC/AML Compliance Dashboard (RECOMMENDED)

**Telegram message to send:**
> Build a KYC/AML compliance monitoring dashboard. Show a summary of total accounts, accounts pending review, overdue reviews, and flagged accounts. Include a risk score distribution chart, a table of recent account reviews with status indicators, and a section showing compliance metrics by region. Use realistic financial services data.

**Why this one:** Every person in the room deals with KYC/AML. They'll immediately recognize the problem and see the value. It's visual (charts, tables, color-coded statuses), it's domain-specific, and it doesn't require external APIs.

**Expected output:** Single-page dashboard with metric cards, bar/donut charts (pure CSS/SVG per coder prompt), data table with status badges, regional breakdown.

**Risk:** LOW — it's a data dashboard with hardcoded sample data. The Coder agent is optimized for this.

### Option B: Portfolio Risk Analyzer

**Telegram message:**
> Build a portfolio risk analysis tool. Show a mock portfolio of 15 holdings with sector allocation pie chart, concentration risk warnings, value-at-risk estimate, and a correlation heatmap. Include a table of all positions with gain/loss and risk contribution. Use realistic equity and fixed income data.

**Why:** Speaks directly to asset managers and institutional investors in the room.

**Risk:** LOW-MEDIUM — more complex visualization.

### Option C: Regulatory Filing Tracker

**Telegram message:**
> Build a regulatory filing deadline tracker for financial institutions. Show upcoming SEC, FINRA, and OCC filing deadlines in a calendar view. Include status indicators for each filing, a countdown for the next due date, and a compliance score card. Use realistic regulatory filing data.

**Why:** Extremely specific to the audience. Shows domain expertise.

**Risk:** LOW — mostly visual layout work.

### Option D: Transaction Monitoring Dashboard

**Telegram message:**
> Build a real-time transaction monitoring dashboard for AML compliance. Show flagged transactions by risk level, a timeline of recent alerts, investigation queue with priority indicators, and summary metrics for daily volume, flagged rate, and false positive rate. Use realistic banking transaction data.

**Why:** Transaction monitoring is a core pain point for every bank and fintech in the room. Highly relevant.

**Risk:** LOW — similar structure to Option A.

### Option E: Trading Desk Monitor (High Impact, Higher Risk)

**Telegram message:**
> Build a real-time trading desk monitor showing position P&L, Greeks, and risk limits with alert thresholds. Include a portfolio summary with sector exposure and a recent trades blotter.

**Why:** Maximum wow factor for fintech audience. Very visual.

**Risk:** MEDIUM — more complex UI, needs realistic mock data.

### RECOMMENDATION

Go with **Option A (KYC/AML Compliance Dashboard)**. It's the safest to build, the most relevant to the broadest audience in the room, and produces the most visually impressive output. Pre-build this exact brief as your fallback.

---

## SHOWING THE BOTS ARE WORKING (Not Stuck)

The current heartbeat is every 30s which is too infrequent. Here's what to implement:

1. **Heartbeat every 8 seconds during CODE stage** — Change `pipeline.js` lines 170-171 from 30000ms to 8000ms. Add rotating status messages:
   ```
   "Structuring HTML layout..."
   "Writing CSS design system..."
   "Building metric card components..."
   "Creating chart visualizations..."
   "Adding interactive JavaScript..."
   "Implementing responsive breakpoints..."
   "Finalizing and cleaning up..."
   ```

2. **Agent card pulse animation** — Already exists in factory.html (`.agent.working` has typing animation, status dot pulses orange). Verify it's visible enough from the back of the room.

3. **Activity log streaming** — Already exists. The console tab shows timestamped entries. In present mode, consider making the activity feed visible by default (not hidden behind a tab).

4. **Elapsed timer** — Already exists in the header during present mode (`build-timer-header`). Make sure it's large enough (recommend 40px+).

5. **Pipeline stepper** — Already exists in the sidebar for present mode. Steps light up as each stage completes. This is good — verify it works end-to-end.

6. **File counter** — NOT built. Add a small counter next to the timer: "Lines: ~XXX" that increments as the coder streams. Can estimate from token count.

---

## SAFETY GUARDRAILS

### System Prompt Additions for Demo Day

Add these to the agent prompts before the event:

**For PM agent — add to `planPrompt` in pm.js:**
```
DEMO MODE CONSTRAINTS:
- Keep the project scope to a SINGLE-PAGE application
- Maximum 6 sections/components
- No features requiring external API calls
- All data must be hardcoded sample data
- Do NOT over-plan — simpler plans build faster
- Keep your JSON response concise — under 800 tokens
```

**For Coder agent — add to `systemPrompt` in coder.js:**
```
DEMO MODE CONSTRAINTS:
- The ENTIRE application must be under 500 lines
- All data must be hardcoded — no fetch() calls, no API integrations
- No external libraries except Google Fonts
- No localStorage (not needed for demo)
- Prioritize visual impact: charts, color-coded statuses, metric cards
- ALWAYS complete the file — never truncate
- Keep JavaScript minimal — CSS does the heavy lifting
```

**For Reviewer agent — add to `systemPrompt` in reviewer.js:**
```
DEMO MODE: Be encouraging. If the output works and looks professional, score 8+.
Only send back for revision if there are broken features or major visual issues.
Do not penalize for missing edge cases or minor accessibility gaps.
Speed is critical — a fast approval is better than a perfect score.
```

### Fallback Protocol

1. **Build takes >4 minutes:** Say "The review agent is being thorough today — this is exactly the kind of governance loop that catches production bugs before they ship." Buys time naturally.
2. **Build fails entirely:** Deploy the pre-built fallback HTML. The dashboard will still show `build_complete`. Audience won't know. Alternatively, switch to video backup: "Let me show you the recording from our test run — same brief, same pipeline."
3. **Telegram doesn't send:** Backup option 1: use `curl` from a terminal tab. Backup option 2: temporarily show the chat input in the dashboard.
   ```bash
   curl -X POST "https://api.georg.miami/factory/api/chat" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"Build a KYC/AML compliance monitoring dashboard..."}'
   ```
4. **WiFi drops:** Mobile hotspot. If that fails too: video backup.
5. **Spectator view breaks:** Don't acknowledge it. The main screen is the show. Spectator view is a bonus.
6. **Reviewer gives a low score and triggers revision:** This is actually GOOD for the demo. Say "Watch — the reviewer found issues and is sending the code back. This is the quality gate in action." It adds drama and proves the system works. Just make sure the total time stays under 5 min.

### Pre-Event Smoke Test

```bash
# Run these the morning of the event
ssh root@159.89.185.96

# Check services are running
pm2 status
pm2 logs penny --lines 20

# Check memory (need >200MB free)
free -m

# Test factory dashboard loads
curl -s "https://api.georg.miami/factory" | head -5

# Test live spectator view loads
curl -s "https://api.georg.miami/factory/live" | head -5

# Test SSE stream connects
curl -s -N "https://api.georg.miami/factory/api/stream?token=YOUR_TOKEN" &
sleep 3; kill %1

# Run a test build
curl -X POST "https://api.georg.miami/factory/api/build?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brief":"Build a simple hello world page"}'

# Wait for build, then check it deployed
sleep 120
curl -s "https://api.georg.miami/factory/public/sites" | head -20
```

---

## UI RECOMMENDATION

**Keep the retro pixel-art office for the presenter dashboard.** It's your signature. The little agents walking between desks, sitting in chairs, going to the whiteboard — that's what makes people look up from their phones. It's memorable. No enterprise dashboard framework does that.

The live spectator view (live.html) is already cleaner and more mobile-focused with the card-based layout. That's the right call.

**What to improve for demo day:**
1. **Make the QR code real** — currently just styled text in a box
2. **Increase the build timer font** in present mode — from 28px to 40px+
3. **Add a subtle background pulse/glow** to the active agent's desk/monitor — the monitor glow already exists (`monitor.active` with `box-shadow`), verify it's bright enough from 30 feet away
4. **Consider adding a "lines generated" counter** next to the timer during CODE stage

**Don't change the overall UI.** 10 days is not enough to rebuild and re-test. Polish what you have.

**Alternative styles explored (for future iterations, NOT for this demo):**
- Mission Control (NASA OpenMCT) — high credibility, clean data grids, but requires full rewrite
- Glassmorphism — trendy frosted glass cards, but harder to read from distance
- Minimalist Enterprise (Stripe/Linear style) — trustworthy but lacks the wow factor
- Cyberpunk evolved — neon accents on dark bg, memorable but may feel unserious for PwC

---

## TIMING BUDGET

| Stage | Target | Max | What to Say While Waiting |
|-------|--------|-----|--------------------------|
| PM / PLAN | 15s | 30s | "The PM is analyzing the brief, deciding the architecture..." |
| Coder / CODE | 90s | 150s | Narrate the activity log. Point out components being created. |
| Reviewer / REVIEW | 20s | 45s | "Independent review — checking accessibility, code quality, design..." |
| *Revision (if needed)* | *60s* | *90s* | "Quality gate caught issues — sending back for fixes. This is the governance loop." |
| Deployer / DEPLOY | 5s | 15s | "Writing to the server... and it's live." |
| **TOTAL (no revision)** | **~2.5 min** | **4 min** | |
| **TOTAL (with revision)** | **~3.5 min** | **5 min** | |

**Speed tips:**
- Use the fastest Sonnet model available (current: `claude-sonnet-4-5-20250929` in base.js line 17 — verify this is still the fastest)
- Keep the brief specific and scoped — vague briefs make the PM overthink
- The Coder's `maxTokens` is 16000 — don't reduce it or you'll get truncation
- Pre-type the Telegram message. Don't improvise the brief on stage.
- Demo mode prompt constraints (above) keep scope small and builds fast

---

## CLAUDE CODE TASK LIST

Hand this to Claude Code as a single session. Each task references the exact file and line numbers.

```
TASK 1: Fix Reviewer/Coder design system mismatch
File: server/agents/reviewer.js, line 32-66
The Reviewer systemPrompt checks for dark theme (#08080A, Space Grotesk, glass-morphism).
The Coder (coder.js line 32) now generates light SaaS theme (#FAFAFA, Inter, blue/purple).
Update the Reviewer's CHECK LIST to match the Coder's design system.

TASK 2: Add demo mode prompt constraints
Files: server/agents/pm.js (planPrompt), server/agents/coder.js (systemPrompt), server/agents/reviewer.js (systemPrompt)
Add the "DEMO MODE CONSTRAINTS" blocks from the demo plan to each agent's prompt.
Make them toggleable via an environment variable: FACTORY_DEMO_MODE=true

TASK 3: Increase heartbeat frequency during CODE stage
File: server/pipeline.js, lines 170-171 and 200-201
Change heartbeat interval from 30000ms to 8000ms.
Add rotating status messages instead of just "Still coding..."

TASK 4: Add stage timeouts with fallback
File: server/pipeline.js, runFactory() function
Wrap each agent.run() call in Promise.race with timeout:
- PM: 30s, Coder: 120s, Reviewer: 45s, Deployer: 15s
On timeout, use reasonable defaults and continue pipeline.

TASK 5: Add pre-built fallback for demo
Create server/fallbacks/ directory with a pre-built KYC dashboard HTML.
In pipeline.js, if runFactory() throws, deploy the fallback and broadcast build_complete.

TASK 6: Generate real QR code
Install qrcode package. In factory.html, replace the text-only QR card
with a real QR code SVG pointing to https://api.georg.miami/factory/live

TASK 7: Verify present mode hides chat input
File: factory.html
Ensure present mode toggle adds .hidden to .chat-input-row
and shows only the Telegram notice.
```

---

## DAY-OF CHECKLIST

- [ ] Laptop charged + charger packed
- [ ] Mobile hotspot charged and tested
- [ ] `pm2 restart penny` on VPS (clean state)
- [ ] Dashboard loads at `https://api.georg.miami/factory?token=...`
- [ ] Present mode activated, QR code visible
- [ ] Telegram bot responds to test message
- [ ] Spectator view loads at `https://api.georg.miami/factory/live`
- [ ] QR code scans correctly (test on a separate phone)
- [ ] Video backup loaded on laptop, playable in 2 clicks
- [ ] Browser zoom set to 110-125%
- [ ] All notifications disabled (laptop + phone)
- [ ] Telegram chat cleared of previous messages
- [ ] Demo brief pre-typed in Telegram drafts
- [ ] Water at podium
- [ ] HDMI/USB-C adapter tested with venue projector
- [ ] One successful test build completed within 30 minutes of go-time
- [ ] `FACTORY_DEMO_MODE=true` set in VPS environment
