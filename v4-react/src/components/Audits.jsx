import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useInView, animate, useReducedMotion } from 'framer-motion'
import Draw from './Draw.jsx'
import ExitFade from './ExitFade.jsx'
import ScoreDial from './ScoreDial.jsx'
import AuditForm from './AuditForm.jsx'
import { AUDIT_STEPS, MAILTO } from '../data.js'
import Magnetic from './Magnetic.jsx'

export default function Audits() {
  // In-view score dial teaser: a motion value eased 0..1 drives the
  // stroke-dashoffset arc and the count-up.
  const dialRef = useRef(null)
  const dialInView = useInView(dialRef, { once: true, margin: '-15%' })
  const dialProgress = useMotionValue(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!dialInView) return
    if (reduced) {
      dialProgress.set(1)
      return
    }
    const controls = animate(dialProgress, 1, { duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 })
    return () => controls.stop()
  }, [dialInView, dialProgress, reduced])

  return (
    <section className="section" id="audits">
      <div className="container">
        <ExitFade>
          <div className="audits-lead">
            <div className="section-head">
              <p className="section-kicker mono">04 · Audits as a product</p>
              <h2 className="section-title">Twelve audits. Twelve distribution problems.</h2>
              <p className="section-sub">
                Free. Research-first, ten dimensions, every claim verified. Delivered as a live
                branded site at client.georg.miami within 48 hours, built to convince their
                customers and you.
              </p>
            </div>
            <div ref={dialRef} style={{ justifySelf: 'center' }}>
              <ScoreDial progress={dialProgress} score={87} caption="Avg audit score" />
            </div>
          </div>
        </ExitFade>

        <div className="audit-steps">
          <svg className="audit-connector" viewBox="0 0 1000 14" preserveAspectRatio="none" aria-hidden="true">
            <Draw
              d="M0 7 C 250 1, 420 13, 560 7 S 880 2, 1000 7"
              stroke="var(--line)"
              strokeWidth={1.5}
              duration={1.5}
            />
          </svg>
          {AUDIT_STEPS.map((s, i) => (
            <motion.div
              className="audit-step"
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-12%' }}
              transition={{ type: 'spring', stiffness: 130, damping: 19, delay: i * 0.14 }}
            >
              <span className="as-n">{s.n}</span>
              <div className="as-t">{s.t}</div>
              <div className="as-d">{s.d}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8%' }}
          transition={{ type: 'spring', stiffness: 110, damping: 20 }}
        >
          <AuditForm />
        </motion.div>

        <div style={{ marginTop: 28 }}>
          <span style={{ color: 'var(--ink-2)', fontSize: 15 }}>
            Prefer to talk first?{' '}
          </span>
          <Magnetic strength={0.2}>
            <a className="scene-link uline" href={MAILTO} style={{ marginTop: 0 }}>
              Book 20 minutes →
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
