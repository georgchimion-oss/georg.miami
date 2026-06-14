import { MARQUEE } from '../data.js'

// Infinite product ticker. CSS-driven (linear, the one allowed linear loop),
// pauses on hover, disabled entirely under prefers-reduced-motion.
export default function Marquee() {
  const seq = (hidden) => (
    <div className="marquee-seq" aria-hidden={hidden || undefined}>
      {MARQUEE.map((name) => (
        <span className="marquee-item" key={name}>
          {name}
        </span>
      ))}
    </div>
  )

  return (
    <div className="marquee" role="marquee" aria-label="15 live AI products">
      <div className="marquee-track">
        {seq(false)}
        {seq(true)}
      </div>
    </div>
  )
}
