import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

const R = 84
const CIRC = 2 * Math.PI * R
const SCORE = 58

// Animated score-dial teaser: stroke-dashoffset count-up.
export default function ScoreDial() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setVal(SCORE)
      return
    }
    const controls = animate(0, SCORE, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, reduced])

  const offset = CIRC * (1 - val / 100)

  return (
    <div>
      <div
        className="dial"
        ref={ref}
        role="img"
        aria-label={`Sample audit score: ${SCORE} out of 100`}
      >
        <svg viewBox="0 0 220 220">
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="rgba(26,23,20,0.08)"
            strokeWidth="14"
          />
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="#C2502B"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="dial-center">
          <div className="dial-num">{Math.round(val)}</div>
          <div className="dial-label mono">/ 100 · sample score</div>
        </div>
      </div>
      <p className="dial-caption">
        A typical first score across the ten dimensions. The gap is the pitch.
      </p>
    </div>
  )
}
