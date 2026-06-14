import { motion, useReducedMotion } from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import { MAILTO } from '../data.js'

const containerV = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const wordV = {
  hidden: { y: '112%' },
  visible: {
    y: '0%',
    transition: { type: 'spring', stiffness: 90, damping: 17 },
  },
}

const fadeV = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 70, damping: 16 },
  },
}

function Line({ text, accent = false }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span className="hero-word-mask" key={i}>
          <motion.span
            className={accent ? 'hero-word accent' : 'hero-word'}
            variants={wordV}
          >
            {w}
          </motion.span>{' '}
        </span>
      ))}
    </>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()

  return (
    <section className="hero" aria-label="Introduction">
      <div className="wash wash-a" aria-hidden="true" />
      <div className="wash wash-b" aria-hidden="true" />
      <div className="wash wash-c" aria-hidden="true" />

      <div className="container hero-grid">
        <motion.div
          variants={containerV}
          initial={reduced ? false : 'hidden'}
          animate="visible"
        >
          <motion.p className="hero-eyebrow mono" variants={fadeV}>
            Georg Chimion · AI automation specialist · Miami
          </motion.p>

          <h1>
            <Line text="AI automation" />
            <br />
            <Line text="for the" /> <Line text="enterprise." accent />
          </h1>

          <motion.p className="hero-sub" variants={fadeV}>
            Enterprise automation, finance AI, and intelligent products.
            Helping companies reduce operational costs with AI that actually
            works. Currently at PwC.
          </motion.p>

          <motion.div className="hero-ctas" variants={fadeV}>
            <Magnetic strength={0.3}>
              <a className="btn btn-fill" href={MAILTO}>
                Book 20 minutes
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a className="btn btn-ghost" href="#work">
                See the work
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-portrait-wrap"
          initial={reduced ? false : { opacity: 0, scale: 1.05, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 55, damping: 16, delay: 0.4 }}
        >
          <img
            className="hero-portrait"
            src="https://georg.miami/georg-hero.jpeg"
            alt="Georg Chimion"
            width="400"
            height="500"
            fetchPriority="high"
            decoding="async"
          />
          <span className="hero-portrait-tag">georg.miami</span>
        </motion.div>
      </div>

      <div className="hero-scrollcue" aria-hidden="true">
        <span className="cue-bar" />
        <span className="mono">scroll</span>
      </div>
    </section>
  )
}
