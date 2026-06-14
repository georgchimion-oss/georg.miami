import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Section exit: content blurs and fades as it scrolls out of the viewport top.
export default function ExitFade({ children, className = '', amount = 1 }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end 0.78', 'end 0.12'],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 1 - 0.62 * amount])
  const yUp = useTransform(scrollYProgress, [0, 1], [0, -26 * amount])
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 7 * amount])
  const filter = useTransform(blurPx, (v) => `blur(${v.toFixed(2)}px)`)

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y: yUp, filter }}>
      {children}
    </motion.div>
  )
}
