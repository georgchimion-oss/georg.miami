import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import Draw from './Draw.jsx'
import ExitFade from './ExitFade.jsx'
import { INDEX_PRODUCTS } from '../data.js'

const gridVariants = {
  hide: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const cardVariants = {
  hide: { opacity: 0, y: 34, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 19 },
  },
}

// Hover physics: spring lift + pointer-tracked tilt (max 3deg) per card.
function TiltCard({ p }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [3, -3]), { stiffness: 220, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-3, 3]), { stiffness: 220, damping: 18 })

  function onMove(e) {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.a
      ref={ref}
      className="index-card"
      href={p.url}
      target="_blank"
      rel="noreferrer"
      variants={cardVariants}
      style={reduced ? undefined : { rotateX, rotateY }}
      whileHover={reduced ? undefined : { y: -7, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="ic-num mono">{p.num}</span>
      <span className="ic-name">{p.name}</span>
      <span className="ic-desc">{p.desc}</span>
      <span className="ic-link">
        {p.label} <span className="arr">→</span>
      </span>
    </motion.a>
  )
}

export default function IndexGrid() {
  return (
    <section className="section" id="index">
      <div className="container">
        <ExitFade>
          <div className="section-head">
            <p className="section-kicker mono">03 · The index</p>
            <h2 className="section-title">Eleven more. All live, all clickable.</h2>
            <svg className="head-rule" viewBox="0 0 1180 12" preserveAspectRatio="none" aria-hidden="true">
              <Draw d="M0 6 C 240 1, 520 11, 1180 5" stroke="var(--line)" strokeWidth={1.5} duration={1.3} />
            </svg>
          </div>
        </ExitFade>
        <motion.div
          className="index-grid"
          variants={gridVariants}
          initial="hide"
          whileInView="show"
          viewport={{ once: true, margin: '-8%' }}
        >
          {INDEX_PRODUCTS.map((p) => (
            <TiltCard p={p} key={p.num} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
