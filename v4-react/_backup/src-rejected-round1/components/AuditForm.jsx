import { useRef, useState } from 'react'

// Ported intact from the existing aqForm (index.html): same steps, same
// validation, same payload, same endpoint. Restyled to v4 tokens only.

const STEP_LABELS = [
  'Step 1 of 4 · You',
  'Step 2 of 4 · Industry',
  'Step 3 of 4 · Pain',
  'Step 4 of 4 · Budget',
]

const MAX_STEP = 4

export default function AuditForm() {
  const formRef = useRef(null)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  function validateStep(n) {
    const form = formRef.current
    if (n === 1) {
      const name = form.elements['name'].value.trim()
      const email = form.elements['email'].value.trim()
      if (!name) return 'Please enter your name.'
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return 'Please enter a valid email.'
    }
    if (n === 2) {
      if (!form.elements['industry'].value)
        return 'Pick what your business does.'
    }
    if (n === 4) {
      if (!form.elements['budget'].value)
        return 'Pick a budget (or "Not sure").'
      if (!form.elements['timeline'].value) return 'Pick a timeline.'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    if (step < MAX_STEP) setStep(step + 1)
  }

  function back() {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  function onSubmit(e) {
    e.preventDefault()
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setSending(true)

    const form = formRef.current
    const painChecks = []
    form
      .querySelectorAll('input[name="pain"]:checked')
      .forEach((c) => painChecks.push(c.value))

    const payload = {
      name: form.elements['name'].value.trim(),
      email: form.elements['email'].value.trim(),
      company: form.elements['company'].value.trim(),
      industry: form.elements['industry'].value,
      pain: painChecks,
      painText: form.elements['painText'].value.trim(),
      budget: form.elements['budget'].value,
      timeline: form.elements['timeline'].value,
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
          'Something went wrong: ' +
            err2.message +
            '. Email georg.chimion@gmail.com instead.',
        )
      })
  }

  return (
    <form
      id="aqForm"
      className="aq-form"
      noValidate
      ref={formRef}
      onSubmit={onSubmit}
    >
      {!done && (
        <div className="aq-progress">
          {[1, 2, 3, 4].map((d) => (
            <span
              key={d}
              className={
                'aq-dot' + (d === step ? ' on' : '') + (d < step ? ' done' : '')
              }
              data-dot={d}
            />
          ))}
          <span className="aq-step-label">{STEP_LABELS[step - 1]}</span>
        </div>
      )}

      <div style={done ? { display: 'none' } : undefined}>
        <div className={'aq-step' + (step === 1 ? ' active' : '')} data-step="1">
          <label>
            Your name
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Jane Doe"
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
            />
          </label>
          <label>
            Company <span className="aq-optional">(optional)</span>
            <input
              type="text"
              name="company"
              autoComplete="organization"
              placeholder="Acme Inc"
            />
          </label>
        </div>

        <div className={'aq-step' + (step === 2 ? ' active' : '')} data-step="2">
          <div className="aq-q">What does your business do?</div>
          <div className="aq-sub">Pick the closest match.</div>
          <div className="aq-choices">
            {[
              'SaaS / Software',
              'Finance / Investing',
              'Real Estate',
              'E-commerce / DTC',
              'Agency / Services',
              'Healthcare',
              'Hospitality / F&B',
              'Other',
            ].map((v) => (
              <label className="aq-radio" key={v}>
                <input type="radio" name="industry" value={v} />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={'aq-step' + (step === 3 ? ' active' : '')} data-step="3">
          <div className="aq-q">What hurts the most right now?</div>
          <div className="aq-sub">Pick any that apply.</div>
          <div className="aq-choices aq-choices-checks">
            {[
              ['Manual data entry', 'Manual data entry eating hours'],
              ['Slow customer response', 'Slow customer response times'],
              ['Fragmented tools', 'Fragmented tools, data everywhere'],
              ['Unclear metrics', "No visibility into what's working"],
              ['Low conversion', 'Traffic but not conversions'],
              ['Team bandwidth', 'Team running at capacity'],
            ].map(([v, label]) => (
              <label className="aq-check" key={v}>
                <input type="checkbox" name="pain" value={v} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <label className="aq-textarea-wrap">
            Anything else: specific problems, what you&apos;ve tried, links
            <textarea
              name="painText"
              rows="4"
              placeholder="Optional. The more you write, the better the audit."
            />
          </label>
        </div>

        <div className={'aq-step' + (step === 4 ? ' active' : '')} data-step="4">
          <div className="aq-q">Budget for a fix?</div>
          <div className="aq-sub">Helps me scope the recommendations.</div>
          <div className="aq-choices">
            {[
              ['Under $5k', 'Under $5k'],
              ['$5k to $25k', '$5k to $25k'],
              ['$25k to $100k', '$25k to $100k'],
              ['$100k+', '$100k+'],
              ['Not sure', 'Not sure yet'],
            ].map(([v, label]) => (
              <label className="aq-radio" key={v}>
                <input type="radio" name="budget" value={v} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="aq-q" style={{ marginTop: 28 }}>
            Timeline?
          </div>
          <div className="aq-choices">
            {[
              ['ASAP', 'ASAP, this month'],
              ['This quarter', 'This quarter'],
              ['Next 6 months', 'Next 6 months'],
              ['Exploring', 'Just exploring'],
            ].map(([v, label]) => (
              <label className="aq-radio" key={v}>
                <input type="radio" name="timeline" value={v} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="aq-error">{error}</div>}

        <div className="aq-nav">
          {step > 1 && (
            <button type="button" className="aq-back" onClick={back}>
              ← Back
            </button>
          )}
          {step < MAX_STEP && (
            <button type="button" className="aq-next" onClick={next}>
              Next →
            </button>
          )}
          {step === MAX_STEP && (
            <button type="submit" className="aq-submit" disabled={sending}>
              {sending ? 'Sending...' : 'Submit audit request'}
            </button>
          )}
        </div>
      </div>

      {done && (
        <div className="aq-success">
          <div className="aq-check-icon">✓</div>
          <div className="aq-success-title">Got it.</div>
          <div className="aq-success-text">
            Georg will email you within 48 hours. Watch your inbox.
          </div>
        </div>
      )}
    </form>
  )
}
