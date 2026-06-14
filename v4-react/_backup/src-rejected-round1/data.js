// Single source: content.md. Copy here mirrors it exactly. No em dashes anywhere.

export const MAILTO =
  'mailto:georg.chimion@gmail.com?subject=Working%20with%20Georg'

export const FLAGSHIPS = [
  {
    name: 'Ask Penny',
    url: 'https://askpenny.georg.miami',
    tagline:
      'Claude connected to a real bank account through Teller or Plaid. Ask about your money in plain English and it answers from live transactions.',
    video: 'https://georg.miami/videos/askpenny.mp4',
    poster: 'https://georg.miami/screenshots/penny.png',
    steps: [
      {
        t: 'Bank API',
        d: 'Teller or Plaid links the live account. Real balances, real transactions, zero mock data.',
      },
      {
        t: 'Transaction store',
        d: 'Every transaction lands in a normalized store Claude can query on demand.',
      },
      {
        t: 'Claude tool-calling',
        d: 'Claude picks the right tool, runs the query, and reads the actual numbers.',
      },
      {
        t: 'Conversational answers',
        d: 'You ask about your money in plain English. It answers from real money, live.',
      },
    ],
  },
  {
    name: 'Agent Factory',
    url: 'https://factory.georg.miami',
    tagline:
      'Four Claude agents plan, build, review, and deploy a production website from one brief. Watch them work the queue in real time.',
    video: 'https://georg.miami/videos/factory.mp4',
    poster: 'https://georg.miami/screenshots/factory.png',
    steps: [
      {
        t: 'One brief in',
        d: 'A single paragraph describing the site. That is the entire input.',
      },
      {
        t: 'Planner agent',
        d: 'Breaks the brief into a build plan and queues the work for the team.',
      },
      {
        t: 'Builder and reviewer',
        d: 'One agent writes the site. Another reviews it and sends back fixes.',
      },
      {
        t: 'Deployer ships it',
        d: 'Live URL in under 5 minutes, brief to production, no human in the loop.',
      },
    ],
  },
  {
    name: 'ReconX',
    url: 'https://reconx.georg.miami',
    tagline:
      'AI reconciliation engine. Multi-pass matching clears the easy hits and surfaces the exceptions a controller actually needs to see. Built on hands-on banking reconciliation work.',
    video: 'https://georg.miami/videos/reconx.mp4',
    poster: 'https://georg.miami/screenshots/reconx.png',
    steps: [
      {
        t: 'Two ledgers in',
        d: 'Bank side and book side, loaded raw, no preprocessing required.',
      },
      {
        t: 'Exact match pass',
        d: 'Clears the obvious one-to-one hits first. Fast, cheap, and out of the way.',
      },
      {
        t: 'Fuzzy pass',
        d: 'Catches the near misses: split payments, date drift, truncated references.',
      },
      {
        t: 'AI exception triage',
        d: 'Claude explains every leftover and routes it to a controller queue.',
      },
    ],
  },
  {
    name: 'Cascade',
    url: 'https://cascade.georg.miami',
    tagline:
      'AI ranks 57 US public filers by supply-chain exposure when a maritime chokepoint closes. Every score is backed by a real 10-K excerpt, using only free public data.',
    image: 'https://georg.miami/screenshots/cascade.png',
    steps: [
      {
        t: 'Chokepoint event',
        d: 'A maritime chokepoint closes. The question: who is exposed, and how badly.',
      },
      {
        t: '10-K corpus scan',
        d: 'AI reads the risk and supply-chain disclosures of 57 US public filers.',
      },
      {
        t: 'Exposure scoring with citations',
        d: 'Every score cites the actual 10-K excerpt that justifies it. No hand-waving.',
      },
      {
        t: 'Ranked watchlist',
        d: 'A defensible exposure ranking, built entirely on free public data.',
      },
    ],
  },
  {
    name: 'The Audit Practice',
    url: null,
    cta: { label: 'Request an audit', href: '#audit-form' },
    tagline:
      'Twelve branded audit sites delivered. Research first, every claim verified, live within 48 hours. Recent gated showcases include lavish-gastronomy.georg.miami and buildrite.georg.miami.',
    dial: true,
    steps: [
      {
        t: 'Send me a business',
        d: 'A name and a URL is enough to start. The research begins the same day.',
      },
      {
        t: '10-dimension audit',
        d: 'Every claim verified against the live business before it ships. No filler findings.',
      },
      {
        t: 'Live branded site in 48h',
        d: 'Built in their brand, to convince their customers, and you.',
      },
    ],
  },
]

export const INDEX_ITEMS = [
  {
    n: '06',
    name: 'Tracker',
    line: 'AI audit and assurance console. 34 live engagements, segregation-of-duties flagging, PCAOB-aligned workflow.',
    url: 'https://tracker.georg.miami',
    img: 'https://georg.miami/screenshots/tracker.png',
  },
  {
    n: '07',
    name: 'Vestia',
    line: 'Six AI modules for South Florida condo compliance: triage, compliance, collections, screening, documents, vendors.',
    url: 'https://vestia.georg.miami',
    img: 'https://georg.miami/screenshots/vestia.png',
  },
  {
    n: '08',
    name: 'AI Document Intelligence',
    line: 'Upload a PDF, watch AI extract structured data in real time. Field-level confidence scores.',
    url: 'https://docs.georg.miami',
    img: 'https://georg.miami/screenshots/docai.png',
  },
  {
    n: '09',
    name: 'Onboard',
    line: 'Upload internal docs, get a structured training course with quizzes in 3 minutes.',
    url: 'https://onboard.georg.miami',
    img: 'https://georg.miami/screenshots/onboard.png',
  },
  {
    n: '10',
    name: 'ORCOM Setup',
    line: 'Bilingual (FR/EN) Claude intake agent for French founders setting up US entities.',
    url: 'https://orcom-setup.georg.miami',
    img: 'https://georg.miami/screenshots/orcom-setup.png',
  },
  {
    n: '11',
    name: 'CallFlow',
    line: 'Voice AI for inbound real-estate calls. Streams audio to Claude, captures structured property data live.',
    url: 'https://jordan.georg.miami',
    img: 'https://georg.miami/screenshots/jordan.png',
  },
  {
    n: '12',
    name: 'DC Command Center',
    line: 'Global data center operations console. Real-time PUE, carbon intensity, incidents across a Tier III/IV fleet.',
    url: 'https://datacenter-command.georg.miami',
    img: 'https://georg.miami/screenshots/datacenter-command.png',
  },
  {
    n: '13',
    name: 'VENUE',
    line: 'Premium private event booking. Wizard for happy hours, dinners, DJ lounges, full buyouts.',
    url: 'https://venue.georg.miami',
    img: 'https://georg.miami/screenshots/venue.png',
  },
  {
    n: '14',
    name: 'Sole Revival',
    line: 'Upload a brand logo, pick a shoe, get 4 photorealistic branded sneaker mockups in under 15 seconds.',
    url: 'https://thesolerevival.georg.miami',
    img: 'https://georg.miami/screenshots/solerevival.png',
  },
  {
    n: '15',
    name: 'SocialPilot',
    line: 'Claude-generated comments for LinkedIn and Twitter, scheduled in optimal windows. Approval queue, not a spam bot.',
    url: 'https://autopilot.georg.miami',
    img: 'https://georg.miami/screenshots/autopilot.png',
  },
  {
    n: '16',
    name: 'Miami AI Community',
    line: 'Hands-on sessions for enterprise teams exploring real AI workflows. Live demos with Claude, hosted in Wynwood.',
    url: 'https://miami.georg.miami',
    img: 'https://georg.miami/screenshots/miami.png',
  },
]

export const CRED_ITEMS = [
  { big: 'PwC', sub: 'today', desc: 'AI systems in production' },
  { num: 15, sub: 'AI products', desc: 'all live, all clickable' },
  { num: 12, sub: 'client audits', desc: 'delivered as live branded sites' },
  {
    big: 'Banking + risk',
    sub: '',
    desc: 'reconciliation, fraud, and compliance systems',
  },
  { big: 'Claude', sub: '', desc: 'multi-agent, on real data' },
]

export const APPROACH_ITEMS = [
  {
    t: 'Multi-agent systems on real data',
    d: 'Claude agents wired to live transactions, filings, and work queues. Not demo JSON.',
  },
  {
    t: 'SQL detection rules for fraud and insider risk',
    d: 'Detection logic written and tuned on bank-scale data inside regulated environments.',
  },
  {
    t: 'Compliance and reconciliation dashboards',
    d: 'Exception queues, SLA tracking, and audit trails that controllers actually work.',
  },
  {
    t: 'POC from transcript to live URL in under 5 minutes',
    d: 'A call transcript in, a clickable deployed prototype out. Same day, every time.',
  },
  {
    t: 'Production deployment, end to end',
    d: 'VPS, pm2, nginx, SSL. One owner from architecture to uptime.',
  },
]
