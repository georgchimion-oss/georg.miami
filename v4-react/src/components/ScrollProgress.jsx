import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { SECTIONS } from '../data.js'

// Thin terracotta rail scrubbed to page scroll + live mono section counter
// and a scrubbed percent readout.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 })
  const percent = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`)
  const [current, setCurrent] = useState(SECTIONS[0])

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const hit = SECTIONS.find((s) => s.id === e.target.id)
            if (hit) setCurrent(hit)
          }
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="progress-rail" aria-hidden="true">
        <motion.div className="progress-fill" style={{ scaleY }} />
      </div>
      <div className="progress-label mono" aria-hidden="true">
        <span className="pl-num">{current.n}</span>
        <span>/ 06</span>
        <span>·</span>
        <span>{current.name}</span>
        <motion.span style={{ color: 'var(--ink-3)' }}>{percent}</motion.span>
      </div>
    </>
  )
}
