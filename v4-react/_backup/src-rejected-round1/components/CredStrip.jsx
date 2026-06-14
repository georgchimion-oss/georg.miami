import { useEffect, useRef } from 'react'
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import Reveal from './Reveal.jsx'
import { CRED_ITEMS } from '../data.js'

function Counter({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [inView, value, reduced, mv])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
    </span>
  )
}

export default function CredStrip() {
  return (
    <section className="cred" aria-label="Credentials">
      <div className="container">
        <div className="cred-grid">
          {CRED_ITEMS.map((c, i) => (
            <Reveal key={i} delay={i * 0.06} className="cred-cell">
              <div className="cred-big">
                {c.num != null ? <Counter value={c.num} /> : c.big}
                {c.sub ? <span className="cred-sub">{c.sub}</span> : null}
              </div>
              <div className="cred-desc">{c.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
