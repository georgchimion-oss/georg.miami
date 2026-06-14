import { motion } from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import Draw from './Draw.jsx'
import { MAILTO } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <motion.h2
          className="footer-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ type: 'spring', stiffness: 110, damping: 20 }}
        >
          Have a problem worth automating?
        </motion.h2>

        <div className="footer-cta-wrap">
          <svg className="footer-scribble" viewBox="0 0 280 110" preserveAspectRatio="none" aria-hidden="true">
            <Draw
              d="M30 55 C 28 18, 120 8, 178 14 C 248 21, 268 48, 252 76 C 234 104, 96 108, 46 88 C 14 75, 16 44, 52 30"
              stroke="var(--terra)"
              strokeWidth={2}
              duration={1.3}
              delay={0.35}
              opacity={0.7}
            />
          </svg>
          <Magnetic strength={0.4}>
            <a className="btn btn-primary" href={MAILTO} style={{ fontSize: 17, padding: '18px 34px' }}>
              Book 20 minutes
            </a>
          </Magnetic>
        </div>

        <p className="footer-alt">
          Or <a className="uline" href="#audits" style={{ color: 'var(--terra-deep)', fontWeight: 600 }}>request an audit</a> and see how I work first.
        </p>

        <div className="footer-bar">
          <span className="mono">Built by hand. Deployed on my own infra.</span>
          <span className="mono">© 2026 Georg Chimion · Miami</span>
        </div>
      </div>
    </footer>
  )
}
