import Reveal from './Reveal.jsx'
import { APPROACH_ITEMS } from '../data.js'

export default function Approach() {
  return (
    <section id="approach" className="section" aria-label="Approach">
      <div className="container">
        <Reveal>
          <div className="section-kicker mono">Approach</div>
          <h2 className="section-title">
            What an engagement with me looks like.
          </h2>
          <p className="section-sub">
            Evidence, not adjectives. Everything below is something I have
            shipped, not something I plan to learn.
          </p>
        </Reveal>

        <div className="approach-list">
          {APPROACH_ITEMS.map((a, i) => (
            <Reveal key={a.t} delay={i * 0.04} className="approach-row">
              <span className="approach-num">{`0${i + 1}`}</span>
              <span className="approach-title">{a.t}</span>
              <span className="approach-desc">{a.d}</span>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="approach-foot">
            <strong>Currently at PwC.</strong> Available for engagements
            through MBO Partners.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
