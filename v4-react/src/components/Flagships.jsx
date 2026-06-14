import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion'
import ScoreDial from './ScoreDial.jsx'
import ExitFade from './ExitFade.jsx'
import { FLAGSHIPS } from '../data.js'

// Full-viewport PINNED scenes: each flagship is a 400vh track with a sticky
// 100svh stage. useScroll scrubs everything: a 3-layer parallax stack (frame,
// screenshot, floating metric chips at different speeds), system-story steps
// revealing sequentially (AnimatePresence), a draw-in spine connecting them,
// and progress dots showing step N/5.
function FlagshipScene({ f }) {
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Sequential step index: 5 sub-steps across the scrubbed range.
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const s = Math.max(0, Math.min(4, Math.floor((v - 0.06) / 0.165)))
    setStep((prev) => (prev === s ? prev : s))
  })

  // Scene entrance/exit scrub.
  const stageOpacity = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0.25, 1, 1, 0.55])
  const visualScale = useTransform(scrollYProgress, [0, 0.12], [0.92, 1])

  // 3-layer parallax: frame slow, screenshot mid, chips fast (each its own speed).
  const frameY = useTransform(scrollYProgress, [0, 1], [26, -26])
  const shotY = useTransform(scrollYProgress, [0, 1], [70, -70])
  const chipY0 = useTransform(scrollYProgress, [0, 1], [130, -150])
  const chipY1 = useTransform(scrollYProgress, [0, 1], [90, -100])
  const chipY2 = useTransform(scrollYProgress, [0, 1], [170, -190])
  const chipYs = [chipY0, chipY1, chipY2]

  // Step spine draws in as the story progresses (scrubbed stroke-dashoffset).
  const spineOffset = useTransform(scrollYProgress, [0.08, 0.88], [1, 0])

  // Dial scrub progress for the audit-practice scene.
  const dialProgress = useTransform(scrollYProgress, [0.1, 0.8], [0, 1])

  const linkProps = f.external === false ? {} : { target: '_blank', rel: 'noreferrer' }

  return (
    <div className="scene-track" ref={trackRef}>
      <motion.div className="scene-sticky" style={{ opacity: stageOpacity }}>
        <div className="container scene-grid">
          <div className="scene-text">
            <p className="scene-kicker mono">
              <span className="sk-num">{f.num} / 05</span>
              <span>Flagship</span>
            </p>
            <h3 className="scene-name">{f.name}</h3>
            <p className="scene-tagline">{f.tagline}</p>

            <div className="scene-steps">
              <svg className="scene-steps-svg" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
                <motion.path
                  d="M1 0 L 1 100"
                  fill="none"
                  stroke="var(--terra)"
                  strokeWidth="2"
                  pathLength="1"
                  strokeDasharray="1"
                  style={{ strokeDashoffset: spineOffset }}
                />
              </svg>
              {f.steps.map((s, j) => (
                <div
                  className={`scene-step${j <= step ? ' on' : ''}${j === step ? ' current' : ''}`}
                  key={s.t}
                >
                  <span className="step-marker" />
                  <span className="step-title">{s.t}</span>
                </div>
              ))}
            </div>

            <div className="scene-step-detail">
              <AnimatePresence mode="wait">
                <motion.div
                  className="detail-card"
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {f.steps[step].d}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="scene-dots" aria-hidden="true">
              {f.steps.map((s, j) => (
                <span className={`sd${j === step ? ' on' : ''}`} key={s.t} />
              ))}
              <span className="sd-label mono">
                Step {step + 1} / 5
              </span>
            </div>

            <a className="scene-link uline" href={f.url} {...linkProps}>
              {f.urlLabel} →
            </a>
          </div>

          <motion.div className="scene-visual" style={{ scale: visualScale }}>
            <motion.div className="scene-frame" style={{ y: frameY }} />
            {f.dial ? (
              <motion.div className="scene-shot" style={{ y: shotY, background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', justifyContent: 'center' }}>
                <ScoreDial progress={dialProgress} score={87} caption="12 audits delivered" />
              </motion.div>
            ) : (
              <motion.div className="scene-shot" style={{ y: shotY }}>
                <img src={f.shot} alt={`${f.name} screenshot`} loading="lazy" width="1280" height="800" />
              </motion.div>
            )}
            {f.chips.map((c, j) => (
              <motion.div className={`scene-chip c${j}`} key={c} style={{ y: chipYs[j] }}>
                {c}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Flagships() {
  return (
    <section className="section" id="work">
      <div className="container">
        <ExitFade>
          <div className="section-head">
            <p className="section-kicker mono">02 · Flagship work</p>
            <h2 className="section-title">Five systems, scrubbed end to end.</h2>
            <p className="section-sub">
              Scroll through each one. The story advances with you: how the system is wired, step by step, all of it live and clickable.
            </p>
          </div>
        </ExitFade>
      </div>
      {FLAGSHIPS.map((f) => (
        <FlagshipScene f={f} key={f.name} />
      ))}
    </section>
  )
}
