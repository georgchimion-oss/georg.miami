import { useState } from 'react'
import { motion, useTransform, useMotionValueEvent } from 'framer-motion'

const R = 88
const CIRC = 2 * Math.PI * R

// Audit score dial: arc draws via stroke-dashoffset, number counts up.
// Driven by an external MotionValue (0..1), so it can be scroll-scrubbed
// inside a pinned scene or animated in-view in the audits section.
export default function ScoreDial({ progress, score = 87, caption = 'Avg audit score' }) {
  const dashOffset = useTransform(progress, [0, 1], [CIRC, CIRC * (1 - score / 100)])
  const numMv = useTransform(progress, [0, 1], [0, score])
  const [num, setNum] = useState(0)
  useMotionValueEvent(numMv, 'change', (v) => setNum(Math.round(v)))

  return (
    <div className="dial-wrap">
      <svg className="dial-svg" viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r={R} fill="none" stroke="var(--line-soft)" strokeWidth="10" />
        <motion.circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke="var(--terra)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="dial-center">
        <span className="dial-num">{num}</span>
        <span className="dial-cap mono">{caption}</span>
      </div>
    </div>
  )
}
