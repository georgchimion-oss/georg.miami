# Goran's Demo Brief — Claude Event, April 7, 2026
## "Claude in the Enterprise" | PwC Office, Wynwood, Miami

---

## THE OPPORTUNITY

Georg is inviting you to do a live developer demo at a Claude enterprise event. The audience is 40-50 senior executives from fintech, banking, and institutional firms in Miami. The event arc is: Leadership panel → Fraud/AML panel → Pilot-to-Production panel → Georg's live demo (Agent Factory) → **Your demo**.

Georg's demo shows the "business user" angle — he sends a Telegram message and a multi-agent system builds and deploys a full website in ~3 minutes. Your demo should show the **developer productivity** angle — what Claude does for engineers building real enterprise systems.

Together, the two demos tell a complete story: *Claude works for everyone — executives who can't code AND developers who ship production software.*

---

## RECOMMENDED DEMO: Live API Build with Claude Code

**Concept:** In 8-10 minutes, use Claude Code (terminal) to build a working REST API microservice from scratch — something that would normally take a developer half a day. Pick a domain the audience cares about (see options below).

**Why this wins with this audience:**
- Executives understand "we built this in 8 minutes instead of 8 hours" — that's a 60x ROI story
- It's real code, in a real terminal, with real tests — no slides, no mockups
- It contrasts perfectly with Georg's demo: he showed a UI being built; you show the backend/API layer
- Developers in the audience will be blown away; executives will understand the business impact

### Option A: Transaction Monitoring API (RECOMMENDED)
Build a REST API that ingests financial transactions and flags suspicious ones based on rules (amount thresholds, velocity checks, country risk). This ties directly to Frank's fraud/AML panel.

### Option B: Document Compliance Checker API
Build an API endpoint that accepts a document payload (JSON with fields like "client_name", "risk_rating", "kyc_status") and returns a compliance verdict with reasons. Ties to regulatory themes.

### Option C: Incident Response Webhook Service
Build a service that receives alerts (like PagerDuty webhooks), triages severity using Claude, and routes to the right team. Ties to Maja's "pilot to production" panel.

**Strong recommendation: Option A.** It connects to the fraud panel, the audience understands transactions, and the output is visually clear (flagged vs. clean transactions).

---

## YOUR DEMO SCRIPT (8-10 minutes)

### Setup (before your slot)
- Terminal open, font size 20+, dark theme
- Claude Code installed and authenticated
- Empty project directory ready
- Second screen or split: browser ready to test the API with curl or Postman

---

### [0:00] OPENING — The Problem (45 seconds)

> "Thanks Georg — that was incredible to watch. He just showed you what Claude does for someone who *doesn't* code. I'm a developer, so let me show you what it does for someone who *does*.
>
> Right now, if my CTO asked me to build a transaction monitoring API — something that takes in financial transactions and flags suspicious activity — that's a half-day project minimum. Data models, validation, business rules, tests, error handling. In enterprise, that becomes a week once you add code review and QA.
>
> I'm going to build it right now, from an empty folder, in about 5 minutes."

### [0:45] THE BUILD — Claude Code in Action (5-6 minutes)

**Type into Claude Code (spoken aloud as you type):**

> "Build me a Node.js REST API for transaction monitoring. It should have:
> - POST /transactions — accepts a transaction with amount, currency, sender, receiver, country
> - GET /transactions — returns all transactions with their risk flags
> - Risk rules: flag transactions over $10,000, flag transactions from high-risk countries (use FATF list), flag if same sender does more than 5 transactions in 1 hour
> - Include input validation, error handling, and unit tests
> - Use Express and store data in memory for now"

**While Claude Code works, narrate what's happening:**

> "Watch the terminal — Claude is reading my prompt, understanding the domain, and now it's scaffolding the project. It's creating the data models... writing the risk engine... here come the route handlers... and now it's writing tests.
>
> Notice it didn't just dump code — it organized the project like a senior developer would. Separate files for routes, models, and risk logic. Proper error handling. Input validation. This is the kind of structure you'd get from a developer with 5+ years of experience."

### [6:00] THE PROOF — Run It Live (2-3 minutes)

**Start the server:**
```
npm start
```

**Send a clean transaction (in a second terminal or Postman):**
```
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 500, "currency": "USD", "sender": "Acme Corp", "receiver": "Widget Inc", "country": "US"}'
```

> "Clean transaction — $500, domestic, no flags. Now watch this..."

**Send a suspicious one:**
```
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "USD", "sender": "Shell LLC", "receiver": "Offshore Holdings", "country": "MM"}'
```

> "$50,000 to Myanmar — that's going to hit two rules: high amount AND high-risk country. Let's check..."

**Show the flagged result. Then run the tests:**
```
npm test
```

> "All tests passing. We have a working transaction monitoring API with risk detection, input validation, and full test coverage. Built from scratch in [look at clock] about 5 minutes.
>
> What would have taken a senior developer half a day — Claude did in minutes. And it's not throwaway code. This is production-quality structure that a team could actually build on."

### [8:30] CLOSE — The Business Impact (1 minute)

> "Here's what this means for your organization. Every enterprise has a backlog of projects that engineering says will take 'a few sprints.' With Claude, your developers aren't replaced — they're multiplied. A team of 5 ships like a team of 20.
>
> Georg showed you what Claude does for the business side. I showed you what it does for engineering. Together, that's your entire organization moving at a speed that wasn't possible a year ago.
>
> Thank you."

---

## PREP CHECKLIST (Before April 7)

### Must-Do (Days 1-3)
- [ ] Install Claude Code (`npm install -g @anthropic-ai/claude-code`) and authenticate
- [ ] Practice the demo 3 times end-to-end — get comfortable narrating while code generates
- [ ] Time yourself — target 8 minutes total, never exceed 10
- [ ] Test the exact prompt above and refine if Claude Code's output isn't clean enough
- [ ] Verify the API actually works with the curl commands listed

### Should-Do (Days 4-7)
- [ ] Practice with the projector/screen setup at PwC (font size, resolution, visibility from back of room)
- [ ] Prepare a backup: if Claude Code is slow or errors, have a pre-built version you can switch to seamlessly ("Let me switch to the version I built earlier" — no shame, it happens)
- [ ] Coordinate with Georg on exact timing — when does your slot start, how does the MC introduce you
- [ ] Have the curl commands saved in a script or clipboard so you don't fumble typing JSON live

### Nice-to-Have
- [ ] Add a final flourish: after the API works, ask Claude Code to "add a Swagger/OpenAPI docs endpoint" — shows iteration in seconds
- [ ] Prepare one line about your background for the MC to use when introducing you

---

## SAFETY GUARDRAILS

**If Claude Code takes too long (>2 minutes generating):**
> "Claude is being thorough — writing tests and documentation. While it works, let me show you what the output looks like..."
→ Switch to pre-built backup version.

**If the build has an error:**
> "This is live code, and just like in real development, things break. Watch how fast Claude fixes it..."
→ Paste the error back into Claude Code and let it fix. This actually makes a BETTER demo — it shows the debugging workflow.

**If the API test fails:**
> Switch to pre-built backup. "Let me use the version I built in rehearsal — same code, same approach."

**If your internet drops:**
> Claude Code works locally after the initial connection. If it fully drops, switch to backup.

---

## KEY TALKING POINTS (for networking after)

When executives approach you after the demo, here are the value statements they care about:

- **"How much faster is this really?"** → "For standard enterprise backend work — APIs, data pipelines, CRUD services — I'm seeing 5-10x faster. The first draft comes in minutes, and it's production-quality, not throwaway."
- **"Does this replace developers?"** → "No — it multiplies them. I still make all the architecture decisions and review everything. Claude handles the implementation grunt work. It's like having a very fast, very knowledgeable junior developer on every task."
- **"Is the code actually good?"** → "It writes tests, follows patterns, handles edge cases. I review everything before it ships, just like I would with any team member's code. The quality is consistently senior-level."
- **"What about security/compliance?"** → "The code runs in my environment, on my machine. Nothing proprietary leaves the terminal. For enterprise, Anthropic offers private deployments where data never hits external servers."

---

## LOGISTICS

- **Your slot:** After Georg's demo (~7:36 PM) — confirm exact timing with Georg
- **Duration:** 8-10 minutes max
- **Equipment needed:** Your laptop with Claude Code, second terminal/Postman for testing, HDMI adapter for the projector
- **Font size:** Terminal at 20pt minimum. The person in the back row needs to read the code.
- **Standing position:** Next to the screen so you can point at code while narrating

---

*Document prepared for the Claude Enterprise Event, April 7, 2026.*
*Coordinate with Georg (georg.chimion@gmail.com) for final timing and logistics.*
