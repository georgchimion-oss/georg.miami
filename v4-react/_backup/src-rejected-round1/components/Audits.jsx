import Reveal from './Reveal.jsx'
import Magnetic from './Magnetic.jsx'
import AuditForm from './AuditForm.jsx'
import { MAILTO } from '../data.js'

const STEPS = [
  {
    n: '01',
    t: 'Send me a business',
    d: 'A name and a URL is enough. The research starts the same day.',
  },
  {
    n: '02',
    t: '10-dimension audit',
    d: 'Every claim verified against the live business. No filler findings.',
  },
  {
    n: '03',
    t: 'Live branded site in 48h',
    d: 'Built to convince their customers, and you.',
  },
]

export default function Audits() {
  return (
    <section id="audits" className="section audits" aria-label="Audits">
      <div className="container">
        <Reveal>
          <div className="section-kicker mono">Audits as a product</div>
          <h2 className="section-title">
            Twelve audits. Twelve distribution problems.
          </h2>
          <p className="section-sub">
            Every audit ships as a live branded site, not a PDF. Twelve
            delivered so far, each one built to convince the client&apos;s own
            customers as much as the client.
          </p>
        </Reveal>

        <div className="audit-steps-row">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="audit-step-card">
              <div className="audit-step-num">{s.n}</div>
              <div className="audit-step-title">{s.t}</div>
              <div className="audit-step-desc">{s.d}</div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="audit-ctas">
            <Magnetic strength={0.28}>
              <a className="btn btn-fill" href="#audit-form">
                Request an audit
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a className="btn btn-ghost" href={MAILTO}>
                Book 20 minutes
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <div className="aq-wrap" id="audit-form">
          <Reveal>
            <h3 className="section-title" style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', marginBottom: 12 }}>
              Get your personalized growth audit.
            </h3>
            <p className="section-sub" style={{ marginTop: 0, marginBottom: 36 }}>
              Free. Research-first, same ten dimensions as the audits above,
              delivered as a live branded site within a week. Tell me about
              your business.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <AuditForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
