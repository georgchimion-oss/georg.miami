import { motion } from 'framer-motion'

// SVG path draw-in: literal stroke-dashoffset animation, triggered in view.
// pathLength="1" normalizes the path so dasharray/dashoffset run 0..1.
export default function Draw({
  d,
  stroke = 'var(--terra)',
  strokeWidth = 2,
  duration = 1.1,
  delay = 0,
  ...rest
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength="1"
      strokeDasharray="1"
      initial={{ strokeDashoffset: 1, opacity: 0 }}
      whileInView={{ strokeDashoffset: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{
        strokeDashoffset: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.01, delay },
      }}
      {...rest}
    />
  )
}
