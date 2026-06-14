import { useEffect, useRef, useState } from 'react'
import { motion, animate, useInView, useReducedMotion } from 'framer-motion'
import Draw from './Draw.jsx'
import ExitFade from './ExitFade.jsx'
import { CRED } from '../data.js'

// Springy counter roll-up: animate() with spring physics drives the number.
function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    // reduced users already see the final value via the initial state
    if (!inView || reduced) return
    const controls = animate(0, value, {
      type: 'spring',
      stiffness: 64,
      damping: 16,
      mass: 1,
      restDelta: 0.4,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, reduced])

  return (
    <span className="num-row" ref={ref}>
      {display}
      {suffix ? <span className="num-suffix">{suffix}</span> : null}
    </span>
  )
}

export default function CredStrip() {
  return (
    <section className="cred">
      <div className="container">
        <svg className="cred-rule-svg" viewBox="0 0 1180 10" preserveAspectRatio="none" aria-hidden="true">
          <Draw d="M0 5 L 1180 5" stroke="var(--line)" strokeWidth={1.5} duration={1.4} />
        </svg>
        <ExitFade amount={0.7}>
          <div className="cred-grid">
            {CRED.stats.map((s, i) => (
              <motion.div
                className="cred-stat"
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12%' }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: i * 0.08 }}
              >
                <Counter value={s.value} suffix={s.suffix} />
                <p className="stat-label">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            className="cred-line"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {CRED.line}
          </motion.p>
        </ExitFade>
      </div>
    </section>
  )
}
