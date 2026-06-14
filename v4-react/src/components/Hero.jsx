import { Fragment, useEffect } from 'react'
import {
  motion,
  useAnimate,
  useScroll,
  useTransform,
  useReducedMotion,
  stagger,
} from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import Draw from './Draw.jsx'
import ExitFade from './ExitFade.jsx'
import { HERO, MAILTO } from '../data.js'

// Page-load choreography (useAnimate sequence): nav drops in (Nav.jsx), kicker
// clips in, hero words spring up staggered out of line masks, portrait reveals
// via clip-path, sub + CTAs rise, chip pops, scroll cue breathes. One directed beat.
export default function Hero() {
  const [scope, animate] = useAnimate()
  const reduced = useReducedMotion()

  // Hero exit parallax: portrait and headline drift at different speeds on scroll.
  const { scrollY } = useScroll()
  const portraitY = useTransform(scrollY, [0, 700], [0, 90])
  const headY = useTransform(scrollY, [0, 700], [0, -50])

  // Initial hidden state for choreographed plain elements (no flash before sequence).
  const hidden = reduced ? undefined : { opacity: 0 }

  useEffect(() => {
    if (reduced) return
    animate([
      ['.hero-kicker', { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, at: 0.1 }],
      [
        '.hero-word',
        { y: ['115%', '0%'], opacity: [0, 1] },
        {
          type: 'spring',
          stiffness: 150,
          damping: 19,
          mass: 0.9,
          delay: stagger(0.075),
          at: 0.18,
        },
      ],
      [
        '.hero-media',
        { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], opacity: [0, 1] },
        { duration: 0.95, ease: [0.22, 1, 0.36, 1], at: 0.38 },
      ],
      ['.hero-sub', { opacity: [0, 1], y: [22, 0] }, { duration: 0.6, ease: 'easeOut', at: 0.62 }],
      ['.hero-ctas', { opacity: [0, 1], y: [22, 0] }, { duration: 0.6, ease: 'easeOut', at: 0.74 }],
      ['.hero-chip', { opacity: [0, 1], scale: [0.7, 1] }, { type: 'spring', stiffness: 220, damping: 16, at: 1.0 }],
      ['.hero-scrollcue', { opacity: [0, 1] }, { duration: 0.6, at: 1.15 }],
      // Clear the lingering inline clip-path: it clips the chip that hangs off the card edge
      ['.hero-media', { clipPath: 'none' }, { duration: 0.001, at: 1.35 }],
    ])
  }, [animate, reduced])

  return (
    <section className="hero" id="top" ref={scope}>
      <div className="container">
        <ExitFade>
          <div className="hero-grid">
            <motion.div style={reduced ? undefined : { y: headY }}>
              <p className="hero-kicker mono" style={hidden}>
                {HERO.kicker}
              </p>
              <h1 className="hero-h1">
                {HERO.lines.map((line, li) => (
                  <span className="hero-line" key={li}>
                    {line.map((word, wi) => (
                      <Fragment key={`${li}-${word}`}>
                        {wi > 0 ? ' ' : null}
                        <span
                          className={`hero-word${word === 'enterprise.' ? ' terra' : ''}`}
                          style={hidden}
                        >
                          {word}
                        </span>
                      </Fragment>
                    ))}
                  </span>
                ))}
              </h1>
              <svg className="hero-accent-svg" viewBox="0 0 300 18" aria-hidden="true">
                <Draw d="M4 13 C 70 3, 160 3, 296 11" strokeWidth={3} duration={0.9} delay={1.15} />
              </svg>
              <p className="hero-sub" style={hidden}>
                {HERO.sub}
              </p>
              <div className="hero-ctas" style={hidden}>
                <Magnetic>
                  <a className="btn btn-primary" href={MAILTO}>
                    Book 20 minutes
                  </a>
                </Magnetic>
                <a className="mono uline" href="#work" style={{ color: 'var(--ink-2)' }}>
                  See the work ↓
                </a>
              </div>
            </motion.div>

            <motion.div style={reduced ? undefined : { y: portraitY }}>
              <div className="hero-media" style={hidden}>
                <img
                  className="hero-portrait"
                  src={HERO.portrait}
                  alt="Georg Chimion"
                  width="380"
                  height="475"
                  fetchPriority="high"
                />
                <span className="hero-corner tl" aria-hidden="true" />
                <span className="hero-corner br" aria-hidden="true" />
                <div className="hero-chip" style={hidden}>
                  Miami, FL
                  <span className="mono">Currently at PwC</span>
                </div>
              </div>
            </motion.div>
          </div>
        </ExitFade>
      </div>

      <div className="hero-scrollcue" style={hidden} aria-hidden="true">
        <span className="mono">Scroll</span>
        <div className="cue-track">
          <motion.div
            className="cue-dot"
            animate={reduced ? undefined : { y: [-16, 46] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </section>
  )
}
