import { motion } from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import { MAILTO } from '../data.js'

// Nav drops in as the first beat of the page-load choreography.
export default function Nav() {
  return (
    <motion.header
      className="nav"
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 170, damping: 22, delay: 0.05 }}
    >
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          Georg<em>.</em>Chimion
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a className="mono uline nav-hide-sm" href="#work">Work</a>
          <a className="mono uline nav-hide-sm" href="#index">Index</a>
          <a className="mono uline nav-hide-sm" href="#audits">Audits</a>
          <a className="mono uline nav-hide-sm" href="#approach">Approach</a>
          <Magnetic strength={0.25}>
            <a className="btn btn-primary btn-sm" href={MAILTO}>
              Book 20 minutes
            </a>
          </Magnetic>
        </nav>
      </div>
    </motion.header>
  )
}
