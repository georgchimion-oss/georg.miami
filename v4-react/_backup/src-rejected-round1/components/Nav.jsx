import Magnetic from './Magnetic.jsx'
import { MAILTO } from '../data.js'

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="nav-brand" href="#top">
          Georg Chimion<em>.</em>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#index">Index</a>
          <a href="#audits">Audits</a>
          <a href="#approach">Approach</a>
        </nav>
        <Magnetic strength={0.22}>
          <a className="btn btn-fill btn-sm" href={MAILTO}>
            Book 20 minutes
          </a>
        </Magnetic>
      </div>
    </header>
  )
}
