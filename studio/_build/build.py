#!/usr/bin/env python3
"""georg.miami/studio: tecneural-inspired variant of the main site.

Build: python3 _build/build.py            (checks every outbound link, renders ../index.html, runs scans)
       python3 _build/build.py --offline  (skips link checks, treats every link as live)

Content mirrors the live georg.miami homepage (2026-10-16). Links that do not answer 200 at
build time are rendered as a working "ask for a walkthrough" email instead of a dead link.
"""
import concurrent.futures as cf
import html
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OFFLINE = '--offline' in sys.argv
MAIL = 'georg.chimion@gmail.com'


def e(s):
    return html.escape(str(s), quote=True)


def mailto(subject, body=''):
    from urllib.parse import quote
    q = 'subject=' + quote(subject)
    if body:
        q += '&body=' + quote(body)
    return f'mailto:{MAIL}?{q}'


# ----------------------------------------------------------------- data
FLAGSHIPS = [
    {'id': 'penny', 'name': 'Ask Penny', 'url': 'https://askpenny.georg.miami', 'shot': '/screenshots/penny.png?v=l2',
     'tag': 'Finance AI', 'line': 'Claude connected to a real bank account through Teller or Plaid. Ask about your money in plain English and it answers from live transactions.',
     'steps': ['Bank API in', 'Transaction store', 'Claude tool calling', 'Plain-English answers on real money']},
    {'id': 'rulestudio', 'name': 'Rule Studio', 'url': 'https://rulestudio.georg.miami', 'shot': '/screenshots/rulestudio.png?v=l2',
     'tag': 'Fraud and risk', 'line': 'Labeled transactions in, vetted fraud rules out. Mines candidate rules with LightGBM and FP-Growth, cuts the redundant ones, and ships a tuned rule set with the governance trail to defend it.',
     'steps': ['Labeled transactions in', 'Features and leakage check', 'Rules mined', 'Redundant rules cut', 'Tuned rule set out']},
    {'id': 'factory', 'name': 'Agent Factory', 'url': 'https://factory.georg.miami', 'shot': '/screenshots/factory.png?v=l2',
     'tag': 'Multi-agent', 'line': 'Four Claude agents plan, build, review, and deploy a production website from one brief. Watch them work the queue in real time.',
     'steps': ['One brief in', 'Planner, builder, reviewer, deployer', 'Queue worked in real time', 'Live URL in under 5 minutes']},
    {'id': 'reconx', 'name': 'ReconX', 'url': 'https://reconx.georg.miami', 'shot': '/screenshots/reconx.png?v=l2',
     'tag': 'Reconciliation', 'line': 'AI reconciliation engine. Multi-pass matching clears the easy hits and surfaces the exceptions a controller actually needs to see. Built on hands-on banking reconciliation work.',
     'steps': ['Two ledgers in', 'Exact match pass', 'Fuzzy pass', 'AI exception triage', 'Controller queue']},
    {'id': 'cascade', 'name': 'Cascade', 'url': 'https://cascade.georg.miami', 'shot': '/screenshots/cascade.png?v=l2',
     'tag': 'Risk intelligence', 'line': 'AI ranks 57 US public filers by supply-chain exposure when a maritime chokepoint closes. Every score is backed by a real 10-K excerpt, using only free public data.',
     'steps': ['Chokepoint event', '10-K corpus scan', 'Exposure scoring with citations', 'Ranked watchlist']},
    {'id': 'onboard', 'name': 'Onboard', 'url': 'https://onboard.georg.miami', 'shot': '/screenshots/onboard.png?v=l2',
     'tag': 'Training', 'line': 'Upload the internal docs you already have. Onboard turns them into a structured training course with quizzes in about three minutes. New hires take it, get scored, and managers see exactly who is ready to work.',
     'steps': ['Internal docs in', 'Course assembled in minutes', 'Quizzes attached', 'New hires take it, scored', 'Manager sees who is ready']},
]

INDEX = [
    {'n': '06', 'name': 'Crew Agent', 'cat': 'ops', 'url': 'https://crew.georg.miami', 'img': '/screenshots/crew-agent.png?v=l2', 'line': 'A background agent reads the builder app at sunrise, splits the day per crew, and texts every worker their schedule and punch list. The whole morning dispatched in 21 seconds.'},
    {'n': '07', 'name': 'Tracker', 'cat': 'ops', 'url': 'https://tracker.georg.miami', 'img': '/screenshots/tracker.png?v=l2', 'line': 'AI audit and assurance console. 34 live engagements, segregation-of-duties flagging, PCAOB-aligned workflow.'},
    {'n': '08', 'name': 'Vestia', 'cat': 'estate', 'url': 'https://vestia.georg.miami', 'img': '/screenshots/vestia.png?v=l2', 'line': 'Six AI modules for South Florida condo compliance: triage, compliance, collections, screening, documents, vendors.'},
    {'n': '09', 'name': 'Document Intelligence', 'cat': 'ai', 'url': 'https://docs.georg.miami', 'img': '/screenshots/docai.png?v=l2', 'line': 'Upload a PDF, watch AI extract structured data in real time. Field-level confidence scores.'},
    {'n': '10', 'name': 'ORCOM Setup', 'cat': 'ai', 'url': 'https://orcom-setup.georg.miami', 'img': '/screenshots/orcom-setup.png?v=l2', 'line': 'Bilingual (FR/EN) Claude intake agent for French founders setting up US entities.'},
    {'n': '11', 'name': 'CallFlow', 'cat': 'estate', 'url': 'https://callflow.georg.miami', 'img': '/screenshots/callflow-ai.png?v=l2', 'line': 'Voice AI for inbound real-estate calls. Streams audio to Claude, captures structured property data live.'},
    {'n': '12', 'name': 'Datacenter Command', 'cat': 'ops', 'url': 'https://datacenter-command.georg.miami', 'img': '/screenshots/datacenter-command.png?v=l2', 'line': 'Mission control for a global server-farm fleet. Power, cooling, carbon, and incidents, live on one screen. Built for a bank infrastructure pitch.'},
    {'n': '13', 'name': 'VENUE', 'cat': 'estate', 'url': 'https://venue.georg.miami', 'img': '/screenshots/venue.png?v=l2', 'line': 'Premium private event booking. Wizard for happy hours, dinners, DJ lounges, full buyouts.'},
    {'n': '14', 'name': 'Sole Revival', 'cat': 'ai', 'url': 'https://thesolerevival.georg.miami', 'img': '/screenshots/solerevival.png?v=l2', 'line': 'Upload a brand logo, pick a shoe, get 4 photorealistic branded sneaker mockups in under 15 seconds.'},
    {'n': '15', 'name': 'SocialPilot', 'cat': 'ai', 'url': 'https://autopilot.georg.miami', 'img': '/screenshots/autopilot.png?v=l2', 'line': 'Claude-generated comments for LinkedIn and Twitter, scheduled in optimal windows. Approval queue, not a spam bot.'},
    {'n': '16', 'name': 'Miami AI Community', 'cat': 'tools', 'url': 'https://miami.georg.miami', 'img': '/screenshots/miami.png?v=l2', 'line': 'Hands-on sessions for enterprise teams exploring real AI workflows. Live demos with Claude, hosted in Wynwood.'},
    {'n': '17', 'name': 'ROI Calculator', 'cat': 'tools', 'url': 'https://roi.georg.miami', 'img': '/screenshots/roi.png?v=l2', 'line': 'Free tool: estimate what AI automation could save your team in time, money, and errors. Get a tailored plan back.'},
]
CATS = [('all', 'All twelve'), ('ops', 'Finance and ops'), ('ai', 'Agents and AI'), ('estate', 'Real estate and hospitality'), ('tools', 'Tools and community')]

SHELF = [
    {'code': 'A1', 'name': 'La Piscine', 'what': 'French restaurant, Miami Beach', 'line': 'Michelin-trained kitchen; audit on positioning, reviews, and local search.', 'icon': 'cloche'},
    {'code': 'A2', 'name': 'Lynx Health Advisors', 'what': 'Elite concierge medicine', 'line': 'Patient-acquisition audit for a physician-led practice.', 'icon': 'steth'},
    {'code': 'A3', 'name': 'Robin Capital Group', 'what': 'Boutique RIA, Miami Beach', 'line': 'Growth audit plus a rebuilt site shipped alongside it.', 'icon': 'chart'},
    {'code': 'A4', 'name': 'Dram Finance', 'what': 'Fractional whisky investing', 'line': 'Trust-signal audit for a platform selling cask shares.', 'icon': 'barrel'},
    {'code': 'A5', 'name': 'Lavish Gastronomy', 'what': 'Private chef and luxury catering', 'line': 'French-Mediterranean private chef and luxury catering, Miami Beach.', 'icon': 'toque'},
    {'code': 'A6', 'name': 'French Morning', 'what': 'French-language US media', 'line': 'French-language US media across six city editions. Revenue-side growth audit.', 'icon': 'paper'},
]

PERSONAS = [
    {'id': 'finance', 'tab': 'Finance and controllers',
     'pains': [('Month-end close lives in spreadsheets', 'Two ledgers, thousands of lines, matched by hand.'), ('The real exceptions are buried', 'The easy matches drown out the ones that matter.'), ('Auditors ask for the trail', 'Every cleared item needs a reason on file.')],
     'pill': 'ReconX · Tracker', 'title': 'Reconciliation that clears itself.', 'body': 'Multi-pass matching clears the easy hits and surfaces only the exceptions a controller needs to see, with an assurance console that flags segregation-of-duties issues.', 'url': 'https://reconx.georg.miami', 'cta': 'Open ReconX'},
    {'id': 'risk', 'tab': 'Risk and compliance',
     'pains': [('Fraud rules nobody can defend', 'Rules written once, never tuned, never explained.'), ('Rule sprawl and alert fatigue', 'Redundant rules firing on the same behavior.'), ('Detection on real bank data', 'Insider-risk patterns that need SQL, not slides.')],
     'pill': 'Rule Studio · SQL detection', 'title': 'Fraud rules with a governance trail.', 'body': 'Labeled transactions in, vetted fraud rules out, with the redundant ones cut. Plus fraud and insider-risk detection rules in Databricks SQL for banking clients.', 'url': 'https://rulestudio.georg.miami', 'cta': 'Open Rule Studio'},
    {'id': 'ops', 'tab': 'Operations leaders',
     'pains': [('Onboarding takes weeks', 'New hires read docs nobody keeps current.'), ('Dispatch happens by phone at 6am', 'Someone builds the day by hand, every day.'), ('No view of who is ready', 'Managers guess who can work unsupervised.')],
     'pill': 'Onboard · Crew Agent', 'title': 'The morning, dispatched in seconds.', 'body': 'Internal docs become a scored training course in about three minutes, and a background agent texts every crew its schedule and punch list at sunrise.', 'url': 'https://onboard.georg.miami', 'cta': 'Open Onboard'},
    {'id': 'founders', 'tab': 'Founders',
     'pains': [('An idea and no product yet', 'A deck is not something customers can click.'), ('A US entity from abroad', 'Forms, filings and questions in two languages.'), ('No time for an agency', 'Weeks of scoping before anything ships.')],
     'pill': 'Agent Factory · ORCOM Setup', 'title': 'One brief in, a live product out.', 'body': 'Four Claude agents plan, build, review and deploy a production site from a single brief, and a bilingual intake agent walks French founders through setting up a US entity.', 'url': 'https://orcom-setup.georg.miami', 'cta': 'Open ORCOM Setup'},
    {'id': 'estate', 'tab': 'Real estate',
     'pains': [('Calls lost after hours', 'Leads ring out while the team is showing units.'), ('Condo compliance by email', 'Six workflows, run from an inbox.'), ('Vendors and collections by hand', 'Screening, documents and payments, chased one by one.')],
     'pill': 'Vestia · CallFlow', 'title': 'Six AI modules for one condo board.', 'body': 'Triage, compliance, collections, screening, documents and vendors for South Florida condos, with voice AI that captures structured property data from inbound calls.', 'url': 'https://vestia.georg.miami', 'cta': 'Open Vestia'},
]

TIMELINE = [
    ('20 minutes', 'The call', 'Bring a problem. We map the process, the data behind it, and what done looks like.'),
    ('End of the call', 'A plan', 'You leave with the build, the data it needs, and the cost it removes.'),
    ('Minutes later', 'A live proof of concept', 'From the call transcript to a live URL before the follow-up email goes out.'),
    ('A few days', 'A working prototype', 'Running on your real data, not a toy dataset.'),
    ('Production', 'Owned infrastructure', 'VPS, pm2, nginx, SSL. Deployed on owned infrastructure, no platform lock-in.'),
]

APPROACH = [
    ('Multi-agent systems on real data', 'Claude agents that plan, build, review, and ship against live systems, not toy datasets.'),
    ('SQL detection rules', 'Fraud and insider-risk detection rules in Databricks SQL for banking clients.'),
    ('Compliance and reconciliation dashboards', 'Controller-grade views: exceptions surfaced, everything else cleared quietly.'),
    ('POC in under 5 minutes', 'From call transcript to a live URL before the follow-up email goes out.'),
    ('Production deployment', 'VPS, pm2, nginx, SSL. Owned infrastructure, no platform lock-in.'),
]

STACK = [
    ('agents', 'Claude and agents', [
        ('Agents', ['Claude', 'Tool calling', 'Multi-agent queues', 'Planner', 'Builder', 'Reviewer', 'Deployer']),
        ('Voice and language', ['Streaming audio to Claude', 'Bilingual FR/EN intake', 'Approval queues']),
        ('Documents', ['PDF extraction', 'Field-level confidence', 'Course generation']),
    ]),
    ('data', 'Data and detection', [
        ('Detection', ['Databricks SQL', 'LightGBM', 'FP-Growth', 'Leakage checks']),
        ('Finance data', ['Teller', 'Plaid', 'Transaction stores', 'Multi-pass matching']),
        ('Public data', ['SEC 10-K filings', 'Citation-backed scoring']),
    ]),
    ('infra', 'Infrastructure', [
        ('Servers', ['VPS', 'pm2', 'nginx', 'SSL']),
        ('Services', ['Node.js', 'Express', 'PostgreSQL', 'Python']),
        ('Delivery', ['Live branded audit sites', '48 hours to live']),
    ]),
    ('ui', 'Interfaces', [
        ('Front end', ['React', 'TypeScript', 'Vite', 'GSAP']),
        ('Dashboards', ['Controller queues', 'Mission-control views', 'Exception triage']),
        ('Conversation', ['Plain-English answers', 'SMS dispatch', 'Chat intake']),
    ]),
]

HERO = [
    {'id': 'auto', 'icon': 'spark', 'eyebrow': 'Enterprise automation', 'kicker': 'Miami, FL · currently at PwC',
     'title': 'AI automation for the <em>enterprise.</em>', 'lede': 'Enterprise automation, finance AI, and intelligent products. Helping companies reduce operational costs with AI that actually works.',
     'video': None, 'ctas': [('#getaudited', 'Get your free audit', 'primary'), ('#work', 'See the work', 'ghost')]},
    {'id': 'finance', 'icon': 'ledger', 'eyebrow': 'Finance AI', 'kicker': 'Banking, risk and reconciliation',
     'title': 'Finance AI a <em>controller</em> can defend.', 'lede': 'Reconciliation, fraud rules and compliance views built on hands-on banking work. Exceptions surfaced, everything else cleared quietly.',
     'video': 'ledger-float', 'ctas': [('https://reconx.georg.miami', 'Open ReconX', 'primary'), ('https://rulestudio.georg.miami', 'Open Rule Studio', 'ghost')]},
    {'id': 'agents', 'icon': 'cubes', 'eyebrow': 'Multi-agent systems', 'kicker': 'Claude, on real data',
     'title': 'One brief in. A <em>live product</em> out.', 'lede': 'Four Claude agents plan, build, review, and deploy a production website from one brief, with a live URL in under five minutes.',
     'video': 'factory-snap', 'ctas': [('https://factory.georg.miami', 'Watch the factory', 'primary'), ('#work', 'See all six flagships', 'ghost')]},
    {'id': 'audits', 'icon': 'search', 'eyebrow': 'The audit practice', 'kicker': 'Research first, claims verified',
     'title': 'Twelve audits. Twelve <em>distribution problems.</em>', 'lede': 'Every business I audit gets research first, claims verified, then a live branded site built to convince their customers.',
     'video': 'audit-scan', 'ctas': [('#getaudited', 'Get your free audit', 'primary'), ('#audits', 'How it works', 'ghost')]},
]

# ----------------------------------------------------------------- link status
def check(url):
    if OFFLINE:
        return url, 200
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 georg-studio-build'})
        with urllib.request.urlopen(req, timeout=12) as r:
            return url, r.status
    except urllib.error.HTTPError as err:
        return url, err.code
    except Exception:
        return url, 0


URLS = sorted({p['url'] for p in FLAGSHIPS} | {p['url'] for p in INDEX} | {p['url'] for p in PERSONAS} | {c[0] for h in HERO for c in h['ctas'] if c[0].startswith('http')} | {'https://tools.georg.miami/', 'https://askpenny.georg.miami'})
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    STATUS = dict(ex.map(check, URLS))
LIVE = {u for u, s in STATUS.items() if s == 200}


URL_NAME = {p['url']: p['name'] for p in FLAGSHIPS + INDEX}


def link(url, label, cls, name_for_mail=None, arrow=True):
    """A live link when the URL answers 200 at build time, otherwise a working walkthrough email."""
    ext = url.startswith('http')
    if ext and url not in LIVE:
        nm = URL_NAME.get(url) or name_for_mail or label
        return f'<a class="{cls}" href="{e(mailto("Walkthrough: " + nm, "Hi Georg, I would like a walkthrough of " + nm + "."))}">Ask for a walkthrough of {e(nm)}{icon("mail", "btn-ic") if arrow else ""}</a>'
    attrs = ' target="_blank" rel="noopener"' if ext else ''
    ic = icon('arrow-up-right' if ext else 'arrow-right', 'btn-ic') if arrow else ''
    return f'<a class="{cls}" href="{e(url)}"{attrs}>{e(label)}{ic}</a>'


def status_pill(url):
    if url in LIVE:
        return '<span class="pill live"><i></i>Live</span>'
    return '<span class="pill req"><i></i>Walkthrough on request</span>'


# ----------------------------------------------------------------- icons
ICONS = {
    'spark': '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.2"/>',
    'ledger': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    'cubes': '<path d="M12 3l7 4v10l-7 4-7-4V7z"/><path d="M12 11l7-4M12 11L5 7M12 11v10"/>',
    'search': '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    'arrow-up-right': '<path d="M7 17L17 7M9 7h8v8"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    'chat': '<path d="M5 18l-1.5 3 4-1.4A8.5 8.5 0 1 0 5 18z"/>',
    'form': '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    'audit': '<path d="M4 19V9M10 19V5M16 19v-7M3 21h18"/>',
    'tools': '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    'penny': '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.6-1.2-1.6 0-2.7.8-2.7 2s1 1.7 2.8 2.1c1.8.4 2.8 1 2.8 2.2s-1.2 2.1-2.8 2.1c-1.2 0-2.3-.5-2.9-1.4M12 6.5v1.5M12 16.5V18"/>',
    'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'x': '<path d="M6 6l12 12M18 6L6 18"/>',
    'play': '<path d="M8 5.5v13l11-6.5z"/>',
    'pause': '<path d="M8 5v14M16 5v14"/>',
    'left': '<path d="M15 5l-7 7 7 7"/>',
    'right': '<path d="M9 5l7 7-7 7"/>',
    'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'down': '<path d="M6 9l6 6 6-6"/>',
    'bolt': '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    'pin': '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'briefcase': '<rect x="3.5" y="7" width="17" height="12" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
    'alert': '<path d="M12 4l9 15H3z"/><path d="M12 10v4M12 17v.5"/>',
    'layers': '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    'user': '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-3.7 3.8-5.5 7-5.5s6 1.8 7 5.5"/>',
}


def icon(name, cls='ic'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'


LINE_ICONS = {
    'cloche': '<path d="M10 46h44"/><path d="M14 46c0-11 8-19 18-19s18 8 18 19"/><path d="M32 27v-4"/><circle cx="32" cy="20.5" r="2.5"/><path d="M8 51h48"/>',
    'steth': '<path d="M18 10v12a10 10 0 0 0 20 0V10"/><path d="M14 10h8M34 10h8"/><path d="M28 32v6a10 10 0 0 0 20 0v-4"/><circle cx="48" cy="30" r="4"/>',
    'chart': '<path d="M12 52h40"/><path d="M18 52V36M28 52V28M38 52V20"/><circle cx="48" cy="40" r="7"/><path d="M48 36.5v7M45.5 40h5"/>',
    'barrel': '<ellipse cx="32" cy="14" rx="14" ry="4"/><path d="M18 14c-3 12-3 24 0 36M46 14c3 12 3 24 0 36"/><ellipse cx="32" cy="50" rx="14" ry="4"/><path d="M17 26h30M17 38h30"/>',
    'toque': '<path d="M20 36c-6 0-9-5-9-9 0-6 6-9 10-7 1-6 6-9 11-9s10 3 11 9c4-2 10 1 10 7 0 4-3 9-9 9"/><path d="M20 36v14h24V36"/><path d="M20 44h24"/>',
    'paper': '<rect x="12" y="12" width="34" height="40" rx="3"/><path d="M46 20h6v28a4 4 0 0 1-4 4H16"/><path d="M18 20h22M18 28h10M18 36h10M18 44h22"/><rect x="32" y="26" width="8" height="12" rx="1"/>',
}


def line_icon(name):
    return f'<svg class="line-ic" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{LINE_ICONS[name].replace("<path ", "<path data-draw ").replace("<circle ", "<circle data-draw ").replace("<ellipse ", "<ellipse data-draw ").replace("<rect ", "<rect data-draw ")}</svg>'


def head(eyebrow, title, sub=None, center=False):
    cls = 'sec-head center reveal' if center else 'sec-head reveal'
    s = f'<p class="sub">{sub}</p>' if sub else ''
    return f'''<div class="{cls}"><div class="eyebrow"><span>{e(eyebrow)}</span><svg class="swoosh" viewBox="0 0 120 8" aria-hidden="true"><path data-draw d="M2 5 C 30 1, 60 7, 118 3"/></svg></div><h2>{title}</h2>{s}</div>'''


def video(name, cls='blend', lazy=True, label=''):
    src = f'assets/video/{name}'
    if lazy:
        return f'<video class="{cls}" muted loop playsinline preload="none" poster="{src}-poster.jpg" data-src="{src}" aria-hidden="true"></video>'
    return f'<video class="{cls}" muted loop playsinline autoplay preload="auto" poster="{src}-poster.jpg" aria-hidden="true"><source src="{src}.webm" type="video/webm"><source src="{src}.mp4" type="video/mp4"></video>'


# ----------------------------------------------------------------- sections
def nav():
    work = ''.join(f'<a href="#work" data-goto-flag="{i}">{e(f["name"])}<span>{e(f["tag"])}</span></a>' for i, f in enumerate(FLAGSHIPS))
    return f'''<header class="nav" id="nav"><div class="nav-in">
  <a class="logo" href="#top" aria-label="Georg Chimion, back to top"><span class="logo-mark">GC</span><span class="logo-txt"><b>Georg Chimion</b><small>AI automation · Miami</small></span></a>
  <nav class="links" aria-label="Main">
    <div class="dd"><button class="dd-btn" aria-expanded="false" aria-controls="ddWork">Work{icon('down', 'dd-ic')}</button><div class="dd-menu" id="ddWork">{work}</div></div>
    <a href="#index">Index</a><a href="#audits">Audits</a><a href="#approach">Approach</a><a href="https://tools.georg.miami/" target="_blank" rel="noopener">Tools</a><a href="#contact">Contact</a>
  </nav>
  <a class="btn primary sm magnet nav-cta" href="#getaudited">Get your free audit{icon('arrow-right', 'btn-ic')}</a>
  <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">{icon('menu')}</button>
</div>
<div class="mnav" id="mnav" hidden><a href="#work">Work</a><a href="#index">Index</a><a href="#audits">Audits</a><a href="#getaudited">Free audit</a><a href="#approach">Approach</a><a href="https://tools.georg.miami/" target="_blank" rel="noopener">Tools</a><a href="#contact">Contact</a></div>
<div class="progress" aria-hidden="true"><i id="progFill"></i></div></header>'''


# link-preview card (rendered from _build/og.html by og.js); hash-versioned so WhatsApp and LinkedIn refetch after a change
import hashlib as _hl
OG_V = _hl.md5(open(os.path.join(ROOT, 'og.jpg'), 'rb').read()).hexdigest()[:8] if os.path.exists(os.path.join(ROOT, 'og.jpg')) else '0'
DUO = all(os.path.exists(os.path.join(ROOT, 'assets', 'video', f)) for f in ('duo.webm', 'duo.mov', 'duo-poster.webp'))
DUO_V = ''
if DUO:
    import hashlib
    DUO_V = hashlib.md5(b''.join(open(os.path.join(ROOT, 'assets', 'video', f), 'rb').read() for f in ('duo.webm', 'duo.mov', 'duo-poster.webp'))).hexdigest()[:8]
# Georg and the robot animated together (Kling take, keyed to alpha): one video, masked to disc + everything above the shoulder line
PORTRAIT_FIGURE = ('<div class="pf-disc"></div>\n  <video class="pf-duo" muted loop playsinline preload="none" width="880" height="880" '
                   f'poster="assets/video/duo-poster.webp?v={DUO_V}" data-src="assets/video/duo" data-v="{DUO_V}" data-alpha="1" aria-hidden="true"></video>') if DUO else (
    '<div class="pf-disc"><img src="assets/img/georg-cut.webp" alt="" width="880" height="880" decoding="async"></div>\n'
    '  <img class="pf-pop" src="assets/img/georg-cut.webp" alt="Georg Chimion" width="880" height="880" decoding="async">')
PORTRAIT_BUDDY = '' if DUO else ('<div class="pf-buddy"><i class="pf-buddy-shadow"></i><video class="pf-buddy-vid" muted loop playsinline preload="none" width="256" height="334" '
                                 'poster="assets/video/robot-shoulder-poster.webp" data-src="assets/video/robot-shoulder" data-alpha="1" aria-hidden="true"></video></div>')


def hero():
    rail = ''.join(f'<button class="rail-btn{" on" if i == 0 else ""}" data-slide="{i}" aria-label="{e(h["eyebrow"])}" aria-pressed="{"true" if i == 0 else "false"}">{icon(h["icon"])}</button>' for i, h in enumerate(HERO))
    slides, arts = [], []
    for i, h in enumerate(HERO):
        tag = 'h1' if i == 0 else 'h2'
        ctas = ''.join(link(u, l, f'btn {k}{" magnet" if k == "primary" else ""}') for u, l, k in h['ctas'])
        hid = '' if i == 0 else ' aria-hidden="true"'
        on = ' on' if i == 0 else ''
        slides.append(f'''<div class="slide{on}" data-i="{i}" role="group" aria-roledescription="slide" aria-label="{i + 1} of {len(HERO)}"{hid}>
    <a class="kick hero-el" href="{"#work" if i != 3 else "#audits"}">{e(h["eyebrow"])} <span aria-hidden="true">&raquo;</span></a>
    <p class="kicker hero-el">{e(h["kicker"])}</p>
    <{tag} class="h1 hero-el">{h["title"]}</{tag}>
    <p class="lede hero-el">{h["lede"]}</p>
    <div class="ctas hero-el">{ctas}</div>
</div>''')
        if h['video']:
            arts.append(f'<div class="art blend{on}" data-i="{i}"><div class="art-glow"></div>{video(h["video"], "art-vid", lazy=(i != 0))}</div>')
        else:
            arts.append(f'''<div class="art portrait{on}" data-i="{i}"><div class="pf">
  <svg class="pf-orbit" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="97"/></svg>
  <svg class="pf-ring" viewBox="0 0 200 200" aria-hidden="true"><circle data-draw cx="100" cy="100" r="99"/></svg>
  {PORTRAIT_FIGURE}
  <span class="pf-chip c1"><i></i>Currently at PwC</span>
  <span class="pf-chip c2"><b>12</b> client audits<em>&middot;</em><b>34</b> live tools</span>
  {PORTRAIT_BUDDY}
  <span class="pf-chip c3">{icon("spark")}My agents, on real data</span>
</div></div>''')
    return f'''<section class="hero" id="top" data-sec="01" data-name="Top" aria-roledescription="carousel" aria-label="What I build">
  <div class="orb o1" aria-hidden="true"></div><div class="orb o2" aria-hidden="true"></div><div class="dots-bg" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <div class="rail" role="group" aria-label="Choose a topic">{rail}</div>
    <div class="slides">{''.join(slides)}</div>
    <div class="arts" aria-hidden="true">{''.join(arts)}</div>
  </div>
  <div class="wrap hero-foot"><div class="pager"><span class="pager-bar"><i id="pagerFill"></i></span><span class="pager-n mono"><b id="pagerNo">01</b> / 0{len(HERO)}</span><button class="pager-btn" id="pagerToggle" aria-label="Pause slideshow">{icon('pause')}</button></div></div>
</section>'''


def cred():
    cells = [
        ('<b class="txt">PwC</b>', 'today', 'AI systems in production'),
        ('<b data-count="34">34</b>', 'live tools', 'on tools.georg.miami'),
        ('<b data-count="12">12</b>', 'client audits', 'delivered as live branded sites'),
        ('<b data-count="5">5</b>', 'minutes', 'from brief to a live URL'),
        ('<b class="txt">Claude</b>', 'multi-agent', 'on real data'),
    ]
    inner = ''.join(f'<div class="cred-cell">{v}<span class="k">{e(k)}</span><span class="d">{e(d)}</span></div>' for v, k, d in cells)
    return f'<section class="cred" aria-label="Credentials"><div class="wrap"><div class="cred-row" data-stagger>{inner}</div></div></section>'


def brief():
    dock = [
        (f'mailto:{MAIL}', 'mail', 'Email me', 'g1'),
        ('#contact', 'chat', 'Send a message', 'g2'),
        ('#getaudited', 'audit', 'Free audit', 'g3'),
        ('https://askpenny.georg.miami', 'penny', 'Try Ask Penny', 'g4'),
        ('https://tools.georg.miami/', 'tools', 'Live tools', 'g5'),
    ]
    ext = ' target="_blank" rel="noopener"'
    tiles = ''.join(f'<a class="dock-tile {g}" href="{e(u)}"{ext if u.startswith("http") else ""} aria-label="{e(lab)}"><span>{icon(ic)}</span><em>{e(lab)}</em></a>' for u, ic, lab, g in dock)
    examples = ['Reconcile 40,000 bank lines a month without a spreadsheet.', 'Turn our SOPs into a training course new hires actually finish.', 'Flag risky transactions before month-end close.', 'Text every crew its schedule before 6am.']
    return f'''<section class="sec brief" id="start" data-sec="02" data-name="Start here"><div class="wrap">
  <div class="center-head reveal"><span class="lineword"><i></i>Start here<i></i></span><h2>Tell me what you want to automate.</h2></div>
  <div class="dock reveal" aria-label="Ways to reach me">{tiles}</div>
  <div class="brief-grid">
    <div class="card chat reveal">
      <div class="chat-head"><div class="chat-who"><img class="chat-ava" src="assets/img/georg-avatar.webp" alt="" width="44" height="44"><div><b>Georg Chimion</b><small>AI automation · Miami</small></div></div><span class="pill live"><i></i>Replies within 24 hours</span></div>
      <div class="chat-body">
        <div class="bubble me">Hi, I'm Georg. Tell me the process that eats your team's week, the tools it runs through, and what done looks like. You leave with a plan, and usually a working prototype a few days later.</div>
        <div class="bubble you" id="typed" data-examples="{e(json.dumps(examples))}">{e(examples[0])}</div>
      </div>
      <form class="chat-input" id="briefForm"><label class="sr" for="briefText">Describe the process you want to automate</label><input id="briefText" name="brief" type="text" maxlength="400" placeholder="Describe it in one sentence..." autocomplete="off"><button class="send" type="submit" aria-label="Continue to the contact form">{icon('arrow-right')}</button></form>
      <p class="chat-note">It drops into the contact form below. Add your name and email and it reaches me.</p>
    </div>
    <div class="card brief-side reveal">
      <p class="side-copy">Bring a problem, leave with a plan. The proof of concept usually exists before the follow-up email goes out.</p>
      <div class="side-art">{video('robot-nod', 'plain', lazy=True)}</div>
      <div class="side-stats"><div><b data-count="12">12</b><span>client audits</span></div><div><b data-count="5">5</b><span>min to a live POC</span></div><div><b data-count="24" data-suffix="h">24h</b><span>reply time</span></div></div>
    </div>
  </div>
</div></section>'''


def flagships():
    tabs = ''.join(f'<button class="tab{" on" if i == 0 else ""}" role="tab" id="ft-{f["id"]}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="fp-{f["id"]}" data-i="{i}">{e(f["name"])}</button>' for i, f in enumerate(FLAGSHIPS))
    panels = []
    for i, f in enumerate(FLAGSHIPS):
        n = len(f['steps'])
        steps = ''.join(f'<li class="fstep" data-k="{k}"><span class="fdot">{icon("check")}</span><span class="ftxt"><b>{e(s)}</b></span></li>' for k, s in enumerate(f['steps']))
        h = 56 * n
        path = f'M20 18 V {h - 30}'
        panels.append(f'''<div class="fpanel{" on" if i == 0 else ""}" role="tabpanel" id="fp-{f["id"]}" aria-labelledby="ft-{f["id"]}" data-i="{i}">
  <div class="fp-left">
    <div class="fp-meta"><span class="pill navy">{e(f["tag"])}</span>{status_pill(f["url"])}</div>
    <h3>{e(f["name"])}</h3>
    <p>{e(f["line"])}</p>
    <div class="fp-shot"><img src="{e(f["shot"])}" alt="{e(f["name"])} interface" loading="lazy" decoding="async"></div>
  </div>
  <div class="fp-right">
    <div class="pipe-label mono">How it runs</div>
    <div class="pipe"><svg class="pipe-svg" viewBox="0 0 40 {h}" preserveAspectRatio="none" aria-hidden="true"><path class="pipe-track" d="{path}"/><path class="pipe-line" id="pp-{f["id"]}" data-draw d="{path}"/><circle class="pipe-dot" r="4" data-path="#pp-{f["id"]}"/></svg><ol class="fsteps">{steps}</ol></div>
    {link(f["url"], "Open " + f["url"].replace("https://", ""), "btn primary magnet", f["name"])}
  </div>
</div>''')
    return f'''<section class="sec scene flag" id="work" data-sec="03" data-name="Flagships"><div class="pin"><div class="wrap">
  {head('Flagships', 'Six products, built end to end.', 'Scroll and each one runs its pipeline. Or pick a tab.')}
  <div class="tabs" role="tablist" aria-label="Flagship products">{tabs}</div>
  <div class="fbox">{''.join(panels)}</div>
  <div class="scene-meter" aria-hidden="true"><i></i></div>
</div></div></section>'''


def personas():
    tabs = ''.join(f'<button class="tab{" on" if i == 0 else ""}" role="tab" id="pt-{p["id"]}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="pp-{p["id"]}" data-i="{i}">{e(p["tab"])}</button>' for i, p in enumerate(PERSONAS))
    panels = []
    for i, p in enumerate(PERSONAS):
        pains = ''.join(f'<div class="pain"><span class="pain-bar"></span><span class="pain-ic">{icon(["alert", "layers", "user"][k])}</span><div><b>{e(t)}</b><span>{e(d)}</span></div></div>' for k, (t, d) in enumerate(p['pains']))
        conns = ''.join(f'<path class="conn" id="cn-{p["id"]}-{k}" data-draw d="M4 {y} C 70 {y}, 60 150, 132 150"/>' for k, y in enumerate([40, 150, 260]))
        dots = ''.join(f'<circle class="conn-dot" r="3.5" data-path="#cn-{p["id"]}-{k}"/>' for k in range(3))
        panels.append(f'''<div class="ppanel{" on" if i == 0 else ""}" role="tabpanel" id="pp-{p["id"]}" aria-labelledby="pt-{p["id"]}" data-i="{i}">
  <div class="pains">{pains}</div>
  <svg class="conns" viewBox="0 0 140 300" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="ah-{p["id"]}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0891B2"/></marker></defs>{conns.replace('data-draw d=', f'marker-end="url(#ah-{p["id"]})" data-draw d=')}{dots}</svg>
  <div class="outcome"><span class="pill navy">{e(p["pill"])}</span><h3>{e(p["title"])}</h3><p>{e(p["body"])}</p>{link(p["url"], p["cta"], "btn primary magnet", p["cta"].replace("Open ", ""))}</div>
</div>''')
    return f'''<section class="sec scene seat" id="seat" data-sec="04" data-name="Whatever your seat"><div class="pin"><div class="wrap">
  {head('Who I build for', 'Whatever your seat, there is a build for it.', None, center=True)}
  <div class="tabs center" role="tablist" aria-label="Who I build for">{tabs}</div>
  <div class="pbox">{''.join(panels)}</div>
  <div class="scene-meter" aria-hidden="true"><i></i></div>
</div></div></section>'''


def index_sec():
    chips = ''.join(f'<button class="chip{" on" if k == "all" else ""}" data-cat="{k}" aria-pressed="{"true" if k == "all" else "false"}">{e(l)}</button>' for k, l in CATS)
    cards = []
    for p in INDEX:
        cards.append(f'''<article class="card pcard" data-cat="{p["cat"]}">
  <div class="pc-img"><img src="{e(p["img"])}" alt="{e(p["name"])} interface" loading="lazy" decoding="async"></div>
  <div class="pc-body"><div class="pc-top"><span class="pc-n mono">{p["n"]}</span>{status_pill(p["url"])}</div><h3>{e(p["name"])}</h3><p>{e(p["line"])}</p>
  {link(p["url"], "Open " + p["name"], "btn ghost sm", p["name"])}</div>
</article>''')
    return f'''<section class="sec idx" id="index" data-sec="05" data-name="Index"><div class="wrap">
  {head('The index', 'Twelve more, built end to end.', 'Every one of these is deployed and built end to end. Filter by where it helps.')}
  <div class="chips reveal" role="group" aria-label="Filter products">{chips}</div>
  <div class="pgrid" id="pgrid">{''.join(cards)}</div>
</div></section>'''


def stack():
    words = sorted({c for _, _, groups in STACK for _, chips in groups for c in chips})
    marquee = ''.join(f'<span>{e(w)}</span>' for w in words)
    tabs = ''.join(f'<button class="tab{" on" if i == 0 else ""}" role="tab" id="st-{k}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="sp-{k}" data-i="{i}">{e(t)}</button>' for i, (k, t, _) in enumerate(STACK))
    panels = []
    icons = ['bolt', 'layers', 'form']
    for i, (k, t, groups) in enumerate(STACK):
        gs = ''.join(f'<div class="card sgroup"><div class="sg-head"><span class="sg-ic">{icon(icons[j % 3])}</span><h3>{e(g)}</h3></div><div class="sg-chips">{"".join(f"<span>{e(c)}</span>" for c in chips)}</div></div>' for j, (g, chips) in enumerate(groups))
        panels.append(f'<div class="spanel{" on" if i == 0 else ""}" role="tabpanel" id="sp-{k}" aria-labelledby="st-{k}">{gs}</div>')
    return f'''<section class="sec stack" id="stack" data-sec="06" data-name="Stack"><div class="wrap">
  {head('Stack and tools', 'The technology behind every build.', None, center=True)}
  </div>
  <div class="marquee" aria-hidden="true"><div class="mq-track">{marquee}{marquee}</div></div>
  <div class="wrap">
  <div class="tabs center" role="tablist" aria-label="Technology">{tabs}</div>
  <div class="sbox">{''.join(panels)}</div>
</div></section>'''


def audits():
    dims = ['Security', 'SEO', 'Performance', 'Social', 'Content', 'Tech stack', 'Mobile', 'Accessibility', 'Brand', 'AI readiness']
    vals = [55, 82, 74, 48, 61, 70, 66, 79, 58, 64]
    bars = ''.join(f'<div class="am-bar"><span>{d}</span><i><b style="--w:{v}%"></b></i></div>' for d, v in zip(dims, vals))
    return f'''<section class="sec scene aud" id="audits" data-sec="07" data-name="Audits"><div class="pin"><div class="wrap aud-grid">
  <div class="aud-copy">
    {head('The audit practice', 'Twelve audits. <em>Twelve distribution problems.</em>', 'Every business I audit gets the same treatment: research first, claims verified, then a live branded site built to convince their customers and you.')}
    <ol class="steps">
      <li class="step on"><span class="mono">01</span><div><b>Research</b><span>Send me a business. I dig into it like it's mine: positioning, traffic, reviews, competitors.</span></div></li>
      <li class="step"><span class="mono">02</span><div><b>Verify</b><span>Ten dimensions, every claim checked against the live site and the market. No guesses.</span></div></li>
      <li class="step"><span class="mono">03</span><div><b>Ship</b><span>A live branded audit site at their name on georg.miami, delivered within 48 hours.</span></div></li>
    </ol>
    <div class="ctas">{link('#getaudited', 'Request an audit', 'btn primary magnet')}{link('#contact', 'Book 20 minutes', 'btn ghost')}</div>
  </div>
  <div class="aud-stage card" aria-hidden="true">
    <div class="am-browser"><div class="am-bar-top"><i></i><i></i><i></i><span class="am-url mono"><span class="am-typed" data-text="yourcompany.georg.miami">yourcompany.georg.miami</span></span></div>
      <div class="am-page">
        <div class="am-research"><img class="am-lens" src="assets/img/audit.webp" alt="" loading="lazy"><div class="am-signals"><span>Positioning</span><span>Traffic</span><span>Reviews</span><span>Competitors</span></div></div>
        <div class="am-verify"><div class="am-dial"><svg viewBox="0 0 120 120"><circle class="amd-track" cx="60" cy="60" r="50"/><circle class="amd-arc" cx="60" cy="60" r="50" pathLength="100"/></svg><div class="amd-num"><b data-count-scene="72">72</b><span>/ 100 before the fix</span></div></div><div class="am-bars">{bars}</div></div>
        <div class="am-ship"><span class="pill live"><i></i>Live in 48 hours</span><span class="am-ship-t">Branded audit site, research and fixes included</span></div>
      </div>
    </div>
    <p class="am-cap mono">average score across 12 audits. plenty to fix.</p>
  </div>
  <div class="scene-meter" aria-hidden="true"><i></i></div>
</div></div></section>'''


def shelf():
    shelf_head = head('From the audit shelf', 'Six recent audits.', "Twelve delivered, each as a live branded site built to convince that client's customers. Most are gated for the client, so access is by request.")
    cards = ''.join(f'''<article class="card scard"><div class="sc-art">{line_icon(a["icon"])}<span class="sc-code mono">{a["code"]}</span></div><div class="sc-body"><span class="pill navy">Client-gated</span><h3>{e(a["name"])}</h3><p class="sc-what">{e(a["what"])}</p><p>{e(a["line"])}</p><a class="tlink" href="{e(mailto("Access to the " + a["name"] + " audit", "Hi Georg, could I see the " + a["name"] + " audit?"))}">Request access{icon('arrow-right', 'btn-ic')}</a></div></article>''' for a in SHELF)
    return f'''<section class="sec shelf" id="auditshelf" data-sec="08" data-name="Audit shelf"><div class="wrap">
  <div class="shelf-head">{shelf_head}<div class="shelf-nav"><button class="round" id="shPrev" aria-label="Previous audits">{icon('left')}</button><button class="round" id="shNext" aria-label="Next audits">{icon('right')}</button></div></div>
  <div class="shelf-track" id="shelfTrack" tabindex="0" aria-label="Recent audits, scroll horizontally">{cards}</div>
  <div class="shelf-dots" id="shelfDots" aria-hidden="true"></div>
</div></section>'''


def getaudited():
    ind = ['SaaS / Software', 'Finance / Investing', 'Real Estate', 'E-commerce / DTC', 'Agency / Services', 'Healthcare', 'Hospitality / F&B', 'Other']
    pains = ["Manual data entry eating hours", "Slow customer response times", "Fragmented tools, data everywhere", "No visibility into what's working", "Traffic but not conversions", "Team running at capacity"]
    budgets = ['Under $5k', '$5k to $25k', '$25k to $100k', '$100k+', 'Not sure yet']
    times = ['ASAP, this month', 'This quarter', 'Next 6 months', 'Just exploring']
    def radios(name, opts):
        return ''.join(f'<label class="opt"><input type="radio" name="{name}" value="{e(o)}"><span>{e(o)}</span></label>' for o in opts)
    painhtml = ''.join(f'<label class="opt"><input type="checkbox" name="pain" value="{e(o)}"><span>{e(o)}</span></label>' for o in pains)
    return f'''<section class="sec getaud" id="getaudited" data-sec="09" data-name="Free audit"><div class="wrap ga-grid">
  <div class="ga-copy">
    {head('Get audited', 'Get your personalized <em>growth audit.</em>', 'Free. Research-first, same ten dimensions as the audits above, delivered as a live branded site within a week. Tell me about your business.')}
    <div class="ga-art reveal"><img src="assets/img/audit.webp" alt="" loading="lazy" decoding="async"></div>
    <p class="note">Recent: lavish-gastronomy.georg.miami and buildrite.georg.miami, both client-gated.</p>
  </div>
  <div class="card ga-card reveal">
    <form id="aqForm" class="aq-form" novalidate>
      <div class="aq-progress"><div class="aq-dots"><i class="aq-dot on" data-dot="1"></i><i class="aq-dot" data-dot="2"></i><i class="aq-dot" data-dot="3"></i><i class="aq-dot" data-dot="4"></i></div><span id="aqStepLabel" class="mono">Step 1 of 4 · You</span></div>
      <div class="aq-step active" data-step="1">
        <div class="fl"><input id="aqName" name="name" type="text" placeholder=" " autocomplete="name" required><label for="aqName">Your name</label></div>
        <div class="fl"><input id="aqEmail" name="email" type="email" placeholder=" " autocomplete="email" required><label for="aqEmail">Work email</label></div>
        <div class="fl"><input id="aqCompany" name="company" type="text" placeholder=" " autocomplete="organization"><label for="aqCompany">Company (optional)</label></div>
      </div>
      <div class="aq-step" data-step="2"><p class="aq-q">What does your business do? <span>Pick the closest match.</span></p><div class="opts">{radios('industry', ind)}</div></div>
      <div class="aq-step" data-step="3"><p class="aq-q">What hurts the most right now? <span>Pick any that apply.</span></p><div class="opts">{painhtml}</div><div class="fl"><textarea id="aqPainText" name="painText" rows="3" placeholder=" "></textarea><label for="aqPainText">Anything else: specific problems, what you've tried, links</label></div></div>
      <div class="aq-step" data-step="4"><p class="aq-q">Budget for a fix? <span>Helps me scope the recommendations.</span></p><div class="opts">{radios('budget', budgets)}</div><p class="aq-q">Timeline?</p><div class="opts">{radios('timeline', times)}</div></div>
      <p class="form-err" id="aqError" hidden></p>
      <div class="aq-nav"><button type="button" class="btn ghost" id="aqBack" hidden>{icon('left', 'btn-ic lead')}Back</button><button type="button" class="btn primary magnet" id="aqNext">Next{icon('arrow-right', 'btn-ic')}</button><button type="submit" class="btn primary magnet" id="aqSubmit" hidden>Submit audit request{icon('arrow-right', 'btn-ic')}</button></div>
      <div class="form-ok" id="aqSuccess" hidden>{icon('check', 'ok-ic')}<div><b>Got it.</b> Georg will email you within 48 hours. Watch your inbox.</div></div>
    </form>
  </div>
</div></section>'''


def timeline():
    nodes = ''.join(f'<li class="tnode" data-k="{k}"><span class="tn-dot"><i></i></span><span class="tn-when mono">{e(w)}</span><b>{e(t)}</b><span class="tn-d">{e(d)}</span></li>' for k, (w, t, d) in enumerate(TIMELINE))
    return f'''<section class="sec scene tl" id="howitruns" data-sec="10" data-name="How a build runs"><div class="pin"><div class="wrap">
  {head('How a build runs', 'From a twenty-minute call <em>to production.</em>', None, center=True)}
  <div class="tl-wrap"><svg class="tl-svg" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true"><path class="tl-track" d="M10 20 H 990"/><path class="tl-line" id="tlPath" data-draw d="M10 20 H 990"/><circle class="tl-spark" r="5" data-path="#tlPath"/></svg><ol class="tnodes">{nodes}</ol></div>
  <div class="scene-meter" aria-hidden="true"><i></i></div>
</div></div></section>'''


def approach():
    items = ''.join(f'''<div class="acc{" open" if i == 0 else ""}"><h3><button class="acc-btn" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="acc-{i}" id="accb-{i}"><span class="acc-n mono">0{i + 1}.</span><span class="acc-t">{e(t)}</span><span class="acc-ic">{icon('plus')}</span></button></h3><div class="acc-body" id="acc-{i}" role="region" aria-labelledby="accb-{i}"><div class="acc-in"><p>{e(d)}</p></div></div></div>''' for i, (t, d) in enumerate(APPROACH))
    return f'''<section class="sec appr" id="approach" data-sec="11" data-name="Approach"><div class="wrap appr-grid">
  <div>{head('Approach', 'What I do on engagements.', 'Evidence, not adjectives. Everything below has shipped to production.')}<p class="note reveal">Currently at PwC. Available for engagements through MBO Partners.</p></div>
  <div class="accs reveal">{items}</div>
</div></section>'''


def contact():
    rows = [('mail', 'Email', f'<a class="tlink" href="mailto:{MAIL}">{MAIL}</a>'), ('pin', 'Based in', 'Miami, Florida'), ('briefcase', 'Engagements', 'Through MBO Partners'), ('clock', 'Reply time', 'Within 24 hours, usually sooner')]
    info = ''.join(f'<div class="ci-row"><span class="ci-ic">{icon(i)}</span><span class="ci-k mono">{e(k)}</span><span class="ci-v">{v}</span></div>' for i, k, v in rows)
    return f'''<section class="sec contact" id="contact" data-sec="12" data-name="Contact"><div class="wrap">
  {head('Contact', "Let's talk.", 'Twenty minutes. Bring a problem, leave with a plan, and usually a working prototype a few days later.')}
  <div class="ct-grid">
    <div class="ct-left"><div class="ct-art reveal"><div class="ct-portrait"><img src="assets/img/georg-avatar-lg.webp" alt="Georg Chimion" width="400" height="400" loading="lazy" decoding="async"></div><b class="ct-name">Georg Chimion</b><span class="ct-role">AI automation · Miami</span></div><div class="ct-info reveal">{info}</div></div>
    <div class="card ct-card reveal">
      <form id="ctForm" class="ct-form" novalidate>
        <div class="fl"><input id="ctName" name="name" type="text" placeholder=" " autocomplete="name" required><label for="ctName">Your name</label></div>
        <div class="fl"><input id="ctEmail" name="email" type="email" placeholder=" " autocomplete="email" required><label for="ctEmail">Work email</label></div>
        <div class="fl"><textarea id="ctMessage" name="message" rows="5" placeholder=" "></textarea><label for="ctMessage">What are you working on?</label></div>
        <p class="form-err" id="ctError" hidden></p>
        <button class="btn primary wide magnet" id="ctSubmit" type="submit">Send it{icon('arrow-right', 'btn-ic')}</button>
        <a class="tlink small" href="mailto:{MAIL}">or just email me</a>
      </form>
      <div class="form-ok" id="ctSuccess" hidden>{icon('check', 'ok-ic')}<div><b>Got it.</b> Your message is in. Georg replies within 24 hours, usually sooner.</div></div>
    </div>
  </div>
</div></section>'''


def footer():
    miami = '''<svg class="miami" viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path data-draw d="M30 70 C 32 52, 36 38, 44 26"/><path data-draw d="M44 26 C 34 22, 24 24, 16 32 M44 26 C 40 16, 32 10, 22 10 M44 26 C 48 16, 56 12, 64 14 M44 26 C 54 24, 62 28, 66 36"/><circle data-draw cx="88" cy="22" r="9"/><path data-draw d="M70 70 V 46 H 104 V 70 M66 46 L 87 34 L 108 46 M78 56 h 18"/><path data-draw d="M4 74 C 16 70, 26 78, 38 74 S 60 70, 72 74 S 96 78, 116 74"/></svg>'''
    return f'''<footer class="foot"><div class="wrap foot-in">
  <div class="foot-loc">{miami}<div><b>Miami</b><span>Built by hand. Deployed on my own infra.</span><a class="tlink" href="mailto:{MAIL}">{MAIL}</a></div></div>
  <div class="foot-links"><a class="tlink" href="/ai-automation-for-finance-teams-miami/">AI automation for finance teams</a><a class="tlink" href="/compliance-automation-consultant/">Compliance automation</a><a class="tlink" href="https://tools.georg.miami/" target="_blank" rel="noopener">Live tools</a><a class="tlink" href="/">The main site</a></div>
</div><div class="wrap foot-bot"><span>georg chimion · miami · © 2026</span><span class="mono">studio edition</span></div></footer>
<div class="help" id="help"><div class="help-pop" id="helpPop" hidden><button class="help-x" id="helpX" aria-label="Dismiss">{icon('x')}</button><p>Got a process that eats your week? Tell me about it.</p><div class="help-acts"><a href="#contact">Send a message</a><a href="#getaudited">Get a free audit</a><a href="mailto:{MAIL}">Email me</a></div></div><button class="help-btn" id="helpBtn" aria-label="Contact options" aria-expanded="false">{icon('chat')}</button></div>'''


# ----------------------------------------------------------------- css / js
CSS = open(os.path.join(HERE, 'studio.css')).read()
JS_BASE = open(os.path.join(HERE, 'base.js')).read()
JS_MOTION = open(os.path.join(HERE, 'motion.js')).read()
TRACK = '''(function(){try{var v=localStorage.getItem('gv');if(!v){v=(crypto.randomUUID&&crypto.randomUUID())||String(Date.now())+Math.random().toString(36).slice(2);localStorage.setItem('gv',v);}var p=new URLSearchParams(location.search);if(p.get('iam')==='georg')localStorage.setItem('go','1');var o=localStorage.getItem('go')==='1';fetch('https://api.georg.miami/ops/track',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({page:location.hostname+location.pathname,ref:document.referrer||null,vid:v,owner:o,ts:Date.now()})}).catch(function(){});}catch(e){}})();'''


def render():
    body = ''.join([nav(), '<main id="main">', hero(), cred(), brief(), flagships(), personas(), index_sec(), stack(), audits(), shelf(), getaudited(), timeline(), approach(), contact(), '</main>', footer()])
    return f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Georg Chimion · AI automation for the enterprise · Studio</title>
<meta name="description" content="Enterprise automation, finance AI, and intelligent products. Six flagships, twelve more live builds, and a research-first audit practice, from Miami.">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://georg.miami/">
<meta property="og:title" content="Georg Chimion · AI automation for the enterprise">
<meta property="og:description" content="Enterprise automation, finance AI, and intelligent products, built end to end.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Georg Chimion">
<meta property="og:url" content="https://georg.miami/studio/">
<meta property="og:image" content="https://georg.miami/studio/og.jpg?v={OG_V}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Georg Chimion with his robot agent on his shoulder, next to the headline AI automation for the enterprise">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://georg.miami/studio/og.jpg?v={OG_V}">
<meta name="theme-color" content="#F8F6F3">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%27 stop-color=%27%2322D3EE%27/%3E%3Cstop offset=%271%27 stop-color=%27%230E7490%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%2764%27 height=%2764%27 rx=%2716%27 fill=%27url(%23g)%27/%3E%3Ctext x=%2732%27 y=%2741%27 font-family=%27Arial,sans-serif%27 font-weight=%27700%27 font-size=%2726%27 fill=%27white%27 text-anchor=%27middle%27%3EGC%3C/text%3E%3C/svg%3E">
<link rel="preload" as="image" href="{("assets/video/duo-poster.webp?v=" + DUO_V) if DUO else "assets/img/georg-cut.webp"}" type="image/webp">
<style>{CSS}</style>
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="sec-ind" aria-hidden="true"><b>01 / 12</b><span>Top</span></div>
{body}
<script>{JS_BASE}</script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/MotionPathPlugin.min.js" defer></script>
<script defer>{JS_MOTION}</script>
<script>{TRACK}</script>
</body>
</html>'''


def main():
    out = render()
    path = os.path.join(ROOT, 'index.html')
    open(path, 'w').write(out)
    down = sorted(u for u, s in STATUS.items() if s != 200)
    print(f'rendered {path} {len(out) / 1024:.0f} KB')
    print('links checked:', len(STATUS), '| not answering 200:', down if down else 'none')
    lines = out.split('\n')
    checks = {
        'em/en dashes (must be 0)': len(re.findall('[—–]', out)),
        'ScrollTrigger lines (>=15)': sum('ScrollTrigger' in l for l in lines),
        'scrub lines (>=4)': sum('scrub' in l for l in lines),
        'stroke-dashoffset lines (>=6)': sum(('stroke-dashoffset' in l or 'strokeDashoffset' in l) for l in lines),
        'prefers-reduced-motion': out.count('prefers-reduced-motion'),
        'size KB (>=60)': round(len(out) / 1024),
        'href="#" dead anchors (must be 0)': out.count('href="#"'),
    }
    for k, v in checks.items():
        print(f'  {k}: {v}')
    ids = set(re.findall(r'id="([^"]+)"', out))
    missing = sorted({h[1:] for h in re.findall(r'href="(#[^"]+)"', out)} - ids)
    print('  in-page anchors without a target (must be empty):', missing)
    if checks['em/en dashes (must be 0)'] or missing or checks['href="#" dead anchors (must be 0)']:
        sys.exit(1)


if __name__ == '__main__':
    main()
