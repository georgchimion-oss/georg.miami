// georg.miami v4 "Cinematic Springs". All copy sourced from content.md only.

export const MAILTO =
  'mailto:georg.chimion@gmail.com?subject=Working%20with%20Georg'

export const HERO = {
  kicker: 'Georg Chimion · AI Automation · Miami',
  lines: [
    ['AI', 'automation'],
    ['for', 'the', 'enterprise.'],
  ],
  sub: 'Enterprise automation, finance AI, and intelligent products. Helping companies reduce operational costs with AI that actually works. Currently at PwC.',
  portrait: 'https://georg.miami/georg-hero.jpeg',
}

export const CRED = {
  stats: [
    { value: 15, suffix: '', label: 'AI products, all live, all clickable' },
    { value: 12, suffix: '', label: 'client audits delivered as live branded sites' },
    { value: 48, suffix: 'h', label: 'from brief to a live branded audit site' },
    { value: 5, suffix: ' min', label: 'transcript to deployed proof of concept' },
  ],
  line: 'Currently at PwC: AI systems in production. Banking and risk: reconciliation, fraud, and compliance systems. Claude multi-agent, on real data.',
}

export const MARQUEE = [
  'Ask Penny',
  'Agent Factory',
  'ReconX',
  'Cascade',
  'Tracker',
  'Vestia',
  'AI Document Intelligence',
  'Onboard',
  'ORCOM Setup',
  'CallFlow',
  'DC Command Center',
  'VENUE',
  'Sole Revival',
  'SocialPilot',
  'Miami AI Community',
]

export const FLAGSHIPS = [
  {
    num: '01',
    name: 'Ask Penny',
    url: 'https://askpenny.georg.miami',
    urlLabel: 'askpenny.georg.miami',
    tagline:
      'Claude connected to a real bank account through Teller or Plaid. Ask about your money in plain English and it answers from live transactions.',
    shot: 'https://georg.miami/screenshots/penny.png',
    chips: ['Live bank data', 'Teller + Plaid', 'Claude tool-calling'],
    steps: [
      { t: 'Bank API', d: 'A real account connects through Teller or Plaid.' },
      { t: 'Transaction store', d: 'Live transactions land in a queryable store.' },
      { t: 'Claude tool-calling', d: 'Claude reasons over the data with tools, not guesses.' },
      { t: 'Plain English in', d: 'You ask about your money the way you would ask a person.' },
      { t: 'Real answers out', d: 'Conversational answers grounded in live transactions.' },
    ],
  },
  {
    num: '02',
    name: 'Agent Factory',
    url: 'https://factory.georg.miami',
    urlLabel: 'factory.georg.miami',
    tagline:
      'Four Claude agents plan, build, review, and deploy a production website from one brief. Watch them work the queue in real time.',
    shot: 'https://georg.miami/screenshots/factory.png',
    chips: ['4 Claude agents', 'Live build queue', 'Live in under 5 min'],
    steps: [
      { t: 'One brief', d: 'A single written brief goes into the queue.' },
      { t: 'Planner agent', d: 'Scopes the build and writes the plan.' },
      { t: 'Builder agent', d: 'Writes the site, end to end.' },
      { t: 'Reviewer agent', d: 'Checks the work before anything ships.' },
      { t: 'Deployer agent', d: 'Pushes to a live URL in under 5 minutes.' },
    ],
  },
  {
    num: '03',
    name: 'ReconX',
    url: 'https://reconx.georg.miami',
    urlLabel: 'reconx.georg.miami',
    tagline:
      'AI reconciliation engine. Multi-pass matching clears the easy hits and surfaces the exceptions a controller actually needs to see. Built on hands-on banking reconciliation work.',
    shot: 'https://georg.miami/screenshots/reconx.png',
    chips: ['Multi-pass matching', 'AI exception triage', 'Controller queue'],
    steps: [
      { t: 'Two ledgers in', d: 'Both sides of the reconciliation load in.' },
      { t: 'Exact match pass', d: 'The easy hits clear themselves.' },
      { t: 'Fuzzy pass', d: 'Near misses get caught and paired.' },
      { t: 'AI triage', d: 'True exceptions are ranked by what matters.' },
      { t: 'Controller queue', d: 'A human sees only what needs a human.' },
    ],
  },
  {
    num: '04',
    name: 'Cascade',
    url: 'https://cascade.georg.miami',
    urlLabel: 'cascade.georg.miami',
    tagline:
      'AI ranks 57 US public filers by supply-chain exposure when a maritime chokepoint closes. Every score is backed by a real 10-K excerpt, using only free public data.',
    shot: 'https://georg.miami/screenshots/cascade.png',
    chips: ['57 filers ranked', 'Cited 10-K excerpts', 'Free public data'],
    steps: [
      { t: 'Chokepoint event', d: 'A maritime chokepoint closes.' },
      { t: '10-K corpus scan', d: 'Filings are scanned for real exposure language.' },
      { t: 'Exposure scoring', d: 'Every score cites the exact excerpt behind it.' },
      { t: 'Ranked watchlist', d: '57 US public filers, ordered by exposure.' },
      { t: 'Zero paid data', d: 'The whole pipeline runs on free public sources.' },
    ],
  },
  {
    num: '05',
    name: 'The Audit Practice',
    url: '#audits',
    urlLabel: 'Request an audit',
    external: false,
    tagline:
      'Twelve delivered branded audit sites. Research the business, run a 10-dimension audit, ship a live branded site at client.georg.miami within 48 hours.',
    dial: true,
    chips: ['12 delivered', '48h turnaround', '10 dimensions'],
    steps: [
      { t: 'Send a business', d: 'A name and a URL is enough to start.' },
      { t: 'Research first', d: 'Every claim in the audit gets verified.' },
      { t: 'Ten dimensions', d: 'Scored across the full digital surface.' },
      { t: 'Branded site', d: 'Built to convince their customers, and you.' },
      { t: 'Live in 48 hours', d: 'At client.georg.miami, gated where needed.' },
    ],
  },
]

export const INDEX_PRODUCTS = [
  { num: '06', name: 'Tracker', desc: 'AI audit and assurance console. 34 live engagements, segregation-of-duties flagging, PCAOB-aligned workflow.', url: 'https://tracker.georg.miami', label: 'tracker.georg.miami' },
  { num: '07', name: 'Vestia', desc: 'Six AI modules for South Florida condo compliance: triage, compliance, collections, screening, documents, vendors.', url: 'https://vestia.georg.miami', label: 'vestia.georg.miami' },
  { num: '08', name: 'AI Document Intelligence', desc: 'Upload a PDF, watch AI extract structured data in real time. Field-level confidence scores.', url: 'https://docs.georg.miami', label: 'docs.georg.miami' },
  { num: '09', name: 'Onboard', desc: 'Upload internal docs, get a structured training course with quizzes in 3 minutes.', url: 'https://onboard.georg.miami', label: 'onboard.georg.miami' },
  { num: '10', name: 'ORCOM Setup', desc: 'Bilingual (FR/EN) Claude intake agent for French founders setting up US entities.', url: 'https://orcom-setup.georg.miami', label: 'orcom-setup.georg.miami' },
  { num: '11', name: 'CallFlow', desc: 'Voice AI for inbound real-estate calls. Streams audio to Claude, captures structured property data live.', url: 'https://jordan.georg.miami', label: 'jordan.georg.miami' },
  { num: '12', name: 'DC Command Center', desc: 'Global data center operations console. Real-time PUE, carbon intensity, incidents across a Tier III/IV fleet.', url: 'https://datacenter-command.georg.miami', label: 'datacenter-command.georg.miami' },
  { num: '13', name: 'VENUE', desc: 'Premium private event booking. Wizard for happy hours, dinners, DJ lounges, full buyouts.', url: 'https://venue.georg.miami', label: 'venue.georg.miami' },
  { num: '14', name: 'Sole Revival', desc: 'Upload a brand logo, pick a shoe, get 4 photorealistic branded sneaker mockups in under 15 seconds.', url: 'https://thesolerevival.georg.miami', label: 'thesolerevival.georg.miami' },
  { num: '15', name: 'SocialPilot', desc: 'Claude-generated comments for LinkedIn and Twitter, scheduled in optimal windows. Approval queue, not a spam bot.', url: 'https://autopilot.georg.miami', label: 'autopilot.georg.miami' },
  { num: '16', name: 'Miami AI Community', desc: 'Hands-on sessions for enterprise teams exploring real AI workflows. Live demos with Claude, hosted in Wynwood.', url: 'https://miami.georg.miami', label: 'miami.georg.miami' },
]

export const AUDIT_STEPS = [
  { n: '1', t: 'Send me a business', d: 'A name and a URL. That is the whole intake.' },
  { n: '2', t: '10-dimension audit', d: 'Research-first. Every claim verified before it ships.' },
  { n: '3', t: 'Live branded site in 48h', d: 'Built to convince their customers, and you.' },
]

export const APPROACH = [
  { num: '01', t: 'Multi-agent systems on real data', d: 'Claude agents that plan, build, review, and ship against live systems, not toy datasets.' },
  { num: '02', t: 'SQL detection rules for fraud and insider risk', d: 'Databricks detection logic for employee-to-account abuse in banking environments.' },
  { num: '03', t: 'Compliance and reconciliation dashboards', d: 'Operational consoles controllers and risk teams actually use.' },
  { num: '04', t: 'POC from transcript to live URL in under 5 minutes', d: 'A call recording in, a working deployed prototype out.' },
  { num: '05', t: 'Production deployment', d: 'VPS, pm2, nginx, SSL. Owned infrastructure, no platform lock-in.' },
]

export const SECTIONS = [
  { id: 'top', n: '01', name: 'Intro' },
  { id: 'work', n: '02', name: 'Work' },
  { id: 'index', n: '03', name: 'Index' },
  { id: 'audits', n: '04', name: 'Audits' },
  { id: 'approach', n: '05', name: 'Approach' },
  { id: 'contact', n: '06', name: 'Contact' },
]
