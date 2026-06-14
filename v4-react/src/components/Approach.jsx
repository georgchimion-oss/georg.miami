import { motion, useReducedMotion } from 'framer-motion'
import Draw from './Draw.jsx'
import ExitFade from './ExitFade.jsx'
import { APPROACH } from '../data.js'

const PIPE = 'M60 30 C 320 60, 90 170, 230 240 S 340 380, 130 440 C 60 462, 150 500, 330 496'

// Engagement pipeline: the bezier draws itself in, node markers pop, and
// data particles flow along the path continuously (SMIL animateMotion).
function Pipeline() {
  const reduced = useReducedMotion()
  const nodes = [
    [60, 30, 'Brief'],
    [196, 116, 'Data'],
    [230, 240, 'Build'],
    [296, 364, 'Review'],
    [330, 496, 'Live'],
  ]

  return (
    <svg className="pipeline-svg" viewBox="0 0 400 530" aria-hidden="true">
      <Draw d={PIPE} stroke="var(--line)" strokeWidth={1.5} duration={1.8} />
      <Draw d={PIPE} stroke="var(--terra)" strokeWidth={2} duration={2.2} delay={0.25} opacity={0.55} />
      {nodes.map(([cx, cy, label], i) => (
        <g key={label}>
          <motion.circle
            cx={cx}
            cy={cy}
            r="7"
            fill="var(--paper)"
            stroke="var(--terra)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.4 + i * 0.22 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          <motion.text
            x={cx + 16}
            y={cy + 4}
            fontFamily="var(--font-mono)"
            fontSize="11"
            letterSpacing="0.12em"
            fill="var(--ink-3)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.4, delay: 0.55 + i * 0.22 }}
          >
            {label.toUpperCase()}
          </motion.text>
        </g>
      ))}
      {/* Data particles flowing along the pipeline, looping */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <circle key={i} r={3.4 - i * 0.5} fill="var(--terra)" opacity={0.85 - i * 0.2}>
            <animateMotion
              dur={`${5.2 + i * 1.7}s`}
              begin={`${i * 1.4}s`}
              repeatCount="indefinite"
              path={PIPE}
            />
          </circle>
        ))}
    </svg>
  )
}

export default function Approach() {
  return (
    <section className="section" id="approach">
      <div className="container">
        <ExitFade>
          <div className="section-head">
            <p className="section-kicker mono">05 · Approach</p>
            <h2 className="section-title">What an engagement gets.</h2>
            <p className="section-sub">Evidence, not adjectives. This is the work, as it runs on real engagements.</p>
          </div>
        </ExitFade>
        <div className="approach-grid">
          <div>
            {APPROACH.map((a, i) => (
              <motion.div
                className="approach-row"
                key={a.num}
                initial={{ opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ type: 'spring', stiffness: 130, damping: 20, delay: i * 0.08 }}
              >
                <span className="ar-num mono">{a.num}</span>
                <div>
                  <div className="ar-t">{a.t}</div>
                  <div className="ar-d">{a.d}</div>
                </div>
              </motion.div>
            ))}
            <motion.p
              className="approach-note"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Currently at PwC. Available for engagements through MBO Partners.
            </motion.p>
          </div>
          <Pipeline />
        </div>
      </div>
    </section>
  )
}
