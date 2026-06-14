import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Ported from the aqForm in the previous georg.miami index.html: same 4 steps,
// same fields, same validation rules, same endpoint and success state. Restyled
// warm, with AnimatePresence slide transitions between steps.

const STEP_LABELS = [
  'Step 1 of 4 · You',
  'Step 2 of 4 · Industry',
  'Step 3 of 4 · Pain',
  'Step 4 of 4 · Budget',
]

const INDUSTRIES = [
  'SaaS / Software',
  'Finance / Investing',
  'Real Estate',
  'E-commerce / DTC',
  'Agency / Services',
  'Healthcare',
  'Hospitality / F&B',
  'Other',
]

const PAINS = [
  ['Manual data entry', 'Manual data entry eating hours'],
  ['Slow customer response', 'Slow customer response times'],
  ['Fragmented tools', 'Fragmented tools, data everywhere'],
  ['Unclear metrics', "No visibility into what's working"],
  ['Low conversion', 'Traffic but not conversions'],
  ['Team bandwidth', 'Team running at capacity'],
]

const BUDGETS = [
  ['Under $5k', 'Under $5k'],
  ['$5k to $25k', '$5k to $25k'],
  ['$25k to $100k', '$25k to $100k'],
  ['$100k+', '$100k+'],
  ['Not sure', 'Not sure yet'],
]

const TIMELINES = [
  ['ASAP', 'ASAP, this month'],
  ['This quarter', 'This quarter'],
  ['Next 6 months', 'Next 6 months'],
  ['Exploring', 'Just exploring'],
]

const MAX_STEP = 4

export default function AuditForm() {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    pain: [],
    painText: '',
    budget: '',
    timeline: '',
  })

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  function togglePain(value) {
    setData((d) => ({
      ...d,
      pain: d.pain.includes(value) ? d.pain.filter((p) => p !== value) : [...d.pain, value],
    }))
  }

  function validateStep(n) {
    if (n === 1) {
      if (!data.name.trim()) return 'Please enter your name.'
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        return 'Please enter a valid email.'
    }
    if (n === 2) {
      if (!data.industry) return 'Pick what your business does.'
    }
    if (n === 4) {
      if (!data.budget) return 'Pick a budget (or "Not sure").'
      if (!data.timeline) return 'Pick a timeline.'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) return setError(err)
    setError('')
    setDir(1)
    if (step < MAX_STEP) setStep(step + 1)
  }

  function back() {
    setError('')
    setDir(-1)
    if (step > 1) setStep(step - 1)
  }

  function onSubmit(e) {
    e.preventDefault()
    const err = validateStep(step)
    if (err) return setError(err)
    setError('')
    setSending(true)

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      company: data.company.trim(),
      industry: data.industry,
      pain: data.pain,
      painText: data.painText.trim(),
      budget: data.budget,
      timeline: data.timeline,
    }

    fetch('https://api.georg.miami/ops/audit-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) =>
        r
          .json()
          .catch(() => ({}))
          .then((j) => ({ ok: r.ok, data: j })),
      )
      .then((res) => {
        if (!res.ok) throw new Error(res.data.error || 'Submission failed')
        setDone(true)
      })
      .catch((err2) => {
        setSending(false)
        setError(
          'Something went wrong: ' + err2.message + '. Email georg.chimion@gmail.com instead.',
        )
      })
  }

  if (done) {
    return (
      <div className="aq-form">
        <motion.div
          className="aq-success"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          <div className="aq-check-icon">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <motion.path
                d="M7 17 L 13 23 L 25 9"
                fill="none"
                stroke="var(--terra)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                strokeDasharray="1"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </div>
          <div className="aq-success-title">Got it.</div>
          <div className="aq-success-text">
            Georg will email you within 48 hours. Watch your inbox.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <form id="aqForm" className="aq-form" noValidate onSubmit={onSubmit}>
      <div className="aq-progress">
        {[1, 2, 3, 4].map((n) => (
          <span className={`aq-dot${n === step ? ' on' : ''}${n < step ? ' done' : ''}`} key={n} />
        ))}
        <span className="aq-step-label mono">{STEP_LABELS[step - 1]}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 36 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 * dir }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          {step === 1 && (
            <div className="aq-step">
              <label>
                Your name
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={data.name}
                  onChange={set('name')}
                />
              </label>
              <label>
                Work email
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="jane@company.com"
                  value={data.email}
                  onChange={set('email')}
                />
              </label>
              <label>
                Company <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span>
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  placeholder="Acme Inc"
                  value={data.company}
                  onChange={set('company')}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="aq-step">
              <div className="aq-q">What does your business do?</div>
              <div className="aq-sub">Pick the closest match.</div>
              <div className="aq-choices">
                {INDUSTRIES.map((ind) => (
                  <label className="aq-radio" key={ind}>
                    <input
                      type="radio"
                      name="industry"
                      value={ind}
                      checked={data.industry === ind}
                      onChange={set('industry')}
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="aq-step">
              <div className="aq-q">What hurts the most right now?</div>
              <div className="aq-sub">Pick any that apply.</div>
              <div className="aq-choices aq-choices-checks">
                {PAINS.map(([value, label]) => (
                  <label className="aq-check" key={value}>
                    <input
                      type="checkbox"
                      name="pain"
                      value={value}
                      checked={data.pain.includes(value)}
                      onChange={() => togglePain(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <label className="aq-textarea-wrap">
                Anything else: specific problems, what you've tried, links
                <textarea
                  name="painText"
                  rows="4"
                  placeholder="Optional. The more you write, the better the audit."
                  value={data.painText}
                  onChange={set('painText')}
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="aq-step">
              <div className="aq-q">Budget for a fix?</div>
              <div className="aq-sub">Helps me scope the recommendations.</div>
              <div className="aq-choices">
                {BUDGETS.map(([value, label]) => (
                  <label className="aq-radio" key={value}>
                    <input
                      type="radio"
                      name="budget"
                      value={value}
                      checked={data.budget === value}
                      onChange={set('budget')}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="aq-q" style={{ marginTop: 28 }}>
                Timeline?
              </div>
              <div className="aq-choices" style={{ marginTop: 14 }}>
                {TIMELINES.map(([value, label]) => (
                  <label className="aq-radio" key={value}>
                    <input
                      type="radio"
                      name="timeline"
                      value={value}
                      checked={data.timeline === value}
                      onChange={set('timeline')}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <div className="aq-error">{error}</div>}

      <div className="aq-nav">
        {step > 1 ? (
          <button type="button" className="aq-back" onClick={back}>
            ← Back
          </button>
        ) : (
          <span />
        )}
        {step < MAX_STEP ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={next}>
            Next →
          </button>
        ) : (
          <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>
            {sending ? 'Sending…' : 'Submit audit request'}
          </button>
        )}
      </div>
    </form>
  )
}
