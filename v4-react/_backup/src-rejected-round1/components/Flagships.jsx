import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import Reveal from './Reveal.jsx'
import ScoreDial from './ScoreDial.jsx'
import { FLAGSHIPS } from '../data.js'

function SceneMedia({ f }) {
  if (f.video) {
    return (
      <video
        controls
        muted
        playsInline
        preload="none"
        poster={f.poster}
        aria-label={`${f.name} demo video`}
      >
        <source src={f.video} type="video/mp4" />
      </video>
    )
  }
  if (f.image) {
    return (
      <img
        src={f.image}
        alt={`${f.name} screenshot`}
        loading="lazy"
        decoding="async"
      />
    )
  }
  if (f.dial) return <ScoreDial />
  return null
}

function FlagshipScene({ f, i }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const stepCount = f.steps.length
  const [active, setActive] = useState(reduced ? stepCount : 0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.5,
  })

  // Steps reveal sequentially across the pinned scroll range 0.08..0.82.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return
    const span = 0.74 / stepCount
    const n = Math.min(stepCount, Math.max(0, Math.floor((v - 0.08) / span) + 1))
    setActive(v < 0.08 ? 0 : n)
  })

  useEffect(() => {
    if (reduced) setActive(stepCount)
  }, [reduced, stepCount])

  // Screenshot parallax, driven by the smoothed scroll progress.
  const mediaY = useTransform(smooth, [0, 1], reduced ? [0, 0] : [70, -70])
  const mediaScale = useTransform(smooth, [0, 1], reduced ? [1, 1] : [1.04, 1])
  const railScale = useTransform(
    smooth,
    [0.08, 0.82],
    reduced ? [1, 1] : [0, 1],
    { clamp: true },
  )

  return (
    <section
      className="scene"
      ref={ref}
      style={{ height: `${110 + stepCount * 52}svh` }}
      aria-label={`Flagship ${i + 1}: ${f.name}`}
    >
      <div className="scene-pin">
        <div className="container scene-grid">
          <div className="scene-copy">
            <div className="scene-count mono">{`0${i + 1} / 05`}</div>
            <h3 className="scene-title">{f.name}</h3>
            <p className="scene-tagline">{f.tagline}</p>

            <div className="scene-steps">
              <motion.div
                className="scene-rail"
                style={{ scaleY: railScale }}
                aria-hidden="true"
              />
              {f.steps.map((s, j) => (
                <motion.div
                  key={j}
                  className="scene-step"
                  initial={false}
                  animate={
                    active > j
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0.22, x: -14 }
                  }
                  transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                >
                  <motion.span
                    className="scene-node"
                    initial={false}
                    animate={
                      active > j
                        ? { scale: 1, backgroundColor: '#C2502B' }
                        : { scale: 0.55, backgroundColor: 'rgba(26,23,20,0.2)' }
                    }
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="scene-step-title">{s.t}</div>
                    <div className="scene-step-desc">{s.d}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="scene-actions">
              {f.url && (
                <a
                  className="scene-link"
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open {f.name} ↗
                </a>
              )}
              {f.cta && (
                <a className="scene-link" href={f.cta.href}>
                  {f.cta.label} ↓
                </a>
              )}
            </div>
          </div>

          <motion.div
            className="scene-media"
            style={{ y: mediaY, scale: mediaScale }}
          >
            <div className="scene-media-halo" aria-hidden="true" />
            <SceneMedia f={f} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function Flagships() {
  return (
    <div id="work">
      <div className="flagships-head">
        <div className="container">
          <Reveal>
            <div className="section-kicker mono">Flagship work</div>
            <h2 className="section-title">
              Five systems, told the way they run.
            </h2>
            <p className="section-sub">
              Scroll through each one. The story unfolds step by step, the same
              way the system executes.
            </p>
          </Reveal>
        </div>
      </div>
      {FLAGSHIPS.map((f, i) => (
        <FlagshipScene key={f.name} f={f} i={i} />
      ))}
    </div>
  )
}
