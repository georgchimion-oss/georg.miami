import Reveal from './Reveal.jsx'
import Magnetic from './Magnetic.jsx'
import { MAILTO } from '../data.js'

export default function Footer() {
  return (
    <footer id="contact" className="footer" aria-label="Contact">
      <div className="container">
        <Reveal>
          <h2 className="footer-title">
            Have something worth automating?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="footer-ctas">
            <Magnetic strength={0.32}>
              <a className="btn btn-fill" href={MAILTO}>
                Book 20 minutes
              </a>
            </Magnetic>
            <a className="footer-email" href={MAILTO}>
              georg.chimion@gmail.com
            </a>
          </div>
        </Reveal>

        <div className="footer-bar">
          <span className="footer-stamp">
            Built by hand. Deployed on my own infra.
          </span>
          <span className="footer-stamp">© 2026 Georg Chimion · Miami</span>
        </div>
      </div>
    </footer>
  )
}
