# georg.miami — Shared Content Inventory (single source for v3/v4/v5 builds)

Created 2026-06-10. Every version builds from THIS content. Versions differ in design execution only.

## Positioning

Georg Chimion. AI automation specialist, Miami. Builds production AI systems for finance and regulated industries. Currently at PwC. The site is a working portfolio, NOT a SaaS product: no pricing, no login, no "start free". Audience: (1) PwC partners/engagement leads deciding whether to book him, (2) freelance prospects who received an audit, (3) Anthropic ambassador credibility.

## Hero

- Statement register (adapt wording per design, keep meaning): "AI automation for the enterprise." / sub: "Enterprise automation, finance AI, and intelligent products. Helping companies reduce operational costs with AI that actually works. Currently at PwC."
- Real proof line allowed (see cred strip). NO fake badges, NO "backed by" pills, NO gradient words, NO sparkle glyphs.
- Portrait available: https://georg.miami/georg-hero.jpeg (also local georg-hero.jpeg, georg.jpeg)
- Primary CTA: "Book 20 minutes" → mailto:georg.chimion@gmail.com?subject=Working%20with%20Georg
- Secondary CTA: scroll to work.

## Cred strip (real numbers, keep)

- PwC today: AI systems in production
- Banking + risk: reconciliation, fraud, and compliance systems
- 15 AI products: all live, all clickable
- 12 client audits: delivered as live branded sites
- Claude: multi-agent, on real data

## Flagship work (the 1/5..5/5 scroll narrative; one full section each)

1. **Ask Penny** — https://askpenny.georg.miami — Claude connected to a real bank account through Teller or Plaid. Ask about your money in plain English and it answers from live transactions. Assets: https://georg.miami/videos/askpenny.mp4, https://georg.miami/screenshots/penny.png, askpenny-dashboard.png. System story: bank API → transaction store → Claude tool-calling → conversational answers on real money.
2. **Agent Factory** — https://factory.georg.miami — Four Claude agents plan, build, review, and deploy a production website from one brief. Watch them work the queue in real time. Assets: videos/factory.mp4, screenshots/factory.png. System story: brief → planner agent → builder → reviewer → deployer → live URL in under 5 minutes.
3. **ReconX** — https://reconx.georg.miami — AI reconciliation engine. Multi-pass matching clears the easy hits and surfaces the exceptions a controller actually needs to see. Built on hands-on banking reconciliation work. Assets: videos/reconx.mp4, screenshots/reconx.png. System story: two ledgers in → exact match pass → fuzzy pass → AI exception triage → controller queue.
4. **Cascade** — https://cascade.georg.miami — AI ranks 57 US public filers by supply-chain exposure when a maritime chokepoint closes. Every score is backed by a real 10-K excerpt, using only free public data. Assets: screenshots/cascade.png. System story: chokepoint event → 10-K corpus scan → exposure scoring with citations → ranked watchlist.
5. **The Audit Practice** (audits as a product, doubles as flagship 5) — 12 delivered branded audit sites. Process: research the business → 10-dimension audit → live branded site at {client}.georg.miami within 48h. Showcase links (public-safe): lavish-gastronomy.georg.miami, buildrite.georg.miami (both gated; show screenshots/describe instead of deep-linking content). Assets: screenshots/critique-*.png exist locally.

## The index (remaining products, dense table/list: name, one-liner, link)

| # | Name | One-liner | URL |
|---|---|---|---|
| 06 | Tracker | AI audit and assurance console. 34 live engagements, segregation-of-duties flagging, PCAOB-aligned workflow. | https://tracker.georg.miami |
| 07 | Vestia | Six AI modules for South Florida condo compliance: triage, compliance, collections, screening, documents, vendors. | https://vestia.georg.miami |
| 08 | AI Document Intelligence | Upload a PDF, watch AI extract structured data in real time. Field-level confidence scores. | https://docs.georg.miami |
| 09 | Onboard | Upload internal docs, get a structured training course with quizzes in 3 minutes. | https://onboard.georg.miami |
| 10 | ORCOM Setup | Bilingual (FR/EN) Claude intake agent for French founders setting up US entities. | https://orcom-setup.georg.miami |
| 11 | CallFlow | Voice AI for inbound real-estate calls. Streams audio to Claude, captures structured property data live. | https://jordan.georg.miami |
| 12 | DC Command Center | Global data center operations console. Real-time PUE, carbon intensity, incidents across a Tier III/IV fleet. | https://datacenter-command.georg.miami |
| 13 | VENUE | Premium private event booking. Wizard for happy hours, dinners, DJ lounges, full buyouts. | https://venue.georg.miami |
| 14 | Sole Revival | Upload a brand logo, pick a shoe, get 4 photorealistic branded sneaker mockups in under 15 seconds. | https://thesolerevival.georg.miami |
| 15 | SocialPilot | Claude-generated comments for LinkedIn and Twitter, scheduled in optimal windows. Approval queue, not a spam bot. | https://autopilot.georg.miami |
| 16 | Miami AI Community | Hands-on sessions for enterprise teams exploring real AI workflows. Live demos with Claude, hosted in Wynwood. | https://miami.georg.miami |

Screenshots for all of the above exist at https://georg.miami/screenshots/{name}.png (verify each href before shipping; tracker.png, vestia.png etc. — check screenshots/ folder listing locally).

## Audits as a product (section content)

- Headline register: "Twelve audits. Twelve distribution problems." or evolve.
- 3-step how it works: (1) Send me a business → (2) 10-dimension audit, every claim verified → (3) Live branded site in 48h, built to convince THEIR customers and you.
- One animated score-dial teaser (SVG stroke-dashoffset count-up) as the visual.
- Keep the existing multi-step audit request form (aqForm) from current index.html lines ~2050-2200: port markup + JS intact.
- CTA: "Request an audit" → form; "Book 20 minutes" → mailto.

## Approach section (for PwC engagement leads)

Capabilities, framed as what he does on engagements: multi-agent systems on real data; SQL detection rules for fraud/insider risk; compliance and reconciliation dashboards; POC from transcript to live URL in under 5 minutes; production deployment (VPS, pm2, nginx, SSL). Tone: evidence, not adjectives. Mention: "Currently at PwC. Available for engagements through MBO Partners."

## Contact / footer

- mailto:georg.chimion@gmail.com?subject=Working%20with%20Georg
- Label: "Book 20 minutes"
- Footer: hairline, mono build stamp "Built by hand. Deployed on my own infra." + year.

## Hard bans (all versions)

- NO purple, NO gradient text, NO sparkle/emoji glyphs in UI chrome
- NO fake SaaS chrome: no Pricing, no Log in, no "Start for free", no fake testimonials/ratings
- NO em dashes anywhere in copy (use periods, commas, colons)
- NO dark theme: light-first, single theme
- Every link must resolve. Every button must do something real.

## Version design briefs (the ONLY thing that differs)

### v3 "Editorial Ledger" (vanilla HTML+CSS+GSAP, single file + assets)
Paper #FBF9F5, ink #16181A, hairlines rgba(22,24,26,0.10), deep teal #0E7490 accent (hover #155E75), copper #8A6131 for numerals/data accents only. Space Grotesk display, DM Sans 400/450 body, JetBrains Mono labels/counters. Numbered mono nav (Work 01 / Audits 02 / Approach 03 / Contact 04). Corner-bracket viewfinder framing on portrait + screenshots. Flagships as 1/5..5/5 full-viewport scroll-driven sections with animated inline SVG line-art system diagrams (stroke-dashoffset draw on scroll). Index as dense ruled table. Subtle grain ok. Register: precision consulting ledger.

### v4 "Cinematic Motion" (Vite + React + Framer Motion, static build)
Warm light: white into soft coral/amber atmospheric washes (NOT gojiberry clone; Georg-brand warmth, terracotta #C2502B-ish accent allowed). Spring physics, scroll-linked pinned scenes for flagships, animated counters in cred strip, immersive oversized hero type. Inter Display or Space Grotesk display. Register: dynamic, cinematic, alive. Must build to static (vite build) deployable to a plain nginx folder with RELATIVE asset paths.

### v5 "Warm Gallery" (vanilla HTML+CSS+GSAP, single file + assets)
Warm white #FFFCF7 → peach atmospheric hero, large friendly display type (Fraunces or similar Google serif display + DM Sans), hand-drawn-feel inline SVG line illustrations narrating each flagship (single-weight strokes), playful micro-interactions (hover tilts, magnetic buttons), generous whitespace, coral #E8604C accent. Register: approachable craft, gallery warmth.

## QA gates (all versions, before handoff)

1. Playwright screenshots at 1440px and 375px to screenshots/ (project folder)
2. Zero horizontal scroll at 375px; tap targets ≥ 44px
3. Every href resolves (curl -o /dev/null -w "%{http_code}")
4. prefers-reduced-motion respected (animations off / instant)
5. Zero em dashes in rendered copy
6. Lighthouse performance > 90 (defer GSAP, lazy-load images/videos)
