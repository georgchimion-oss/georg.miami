import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Ambient background life: coral/amber radial washes drifting continuously,
// plus a slow scroll-scrubbed warmth shift so the atmosphere tracks the page.
// Transform/opacity only, fixed behind everything.
export default function AmbientWash() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const washY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const washOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.75, 0.95])

  const drift = (xs, ys, dur) =>
    reduced
      ? {}
      : {
          animate: { x: xs, y: ys, scale: [1, 1.07, 0.96, 1] },
          transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
        }

  return (
    <motion.div
      className="wash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, delay: 0.35, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <motion.div style={reduced ? undefined : { y: washY, opacity: washOpacity, height: '100%' }}>
        <motion.div className="wash-blob wash-a" {...drift([0, -70, 40, 0], [0, 50, -30, 0], 26)} />
        <motion.div className="wash-blob wash-b" {...drift([0, 80, -50, 0], [0, -60, 40, 0], 32)} />
        <motion.div className="wash-blob wash-c" {...drift([0, -50, 60, 0], [0, -40, 20, 0], 38)} />
      </motion.div>
    </motion.div>
  )
}
