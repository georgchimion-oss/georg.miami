import { motion } from 'framer-motion'
import Reveal from './Reveal.jsx'
import { INDEX_ITEMS } from '../data.js'

export default function IndexGrid() {
  return (
    <section id="index" className="section" aria-label="Product index">
      <div className="container">
        <Reveal>
          <div className="section-kicker mono">The index</div>
          <h2 className="section-title">Eleven more. All live.</h2>
          <p className="section-sub">
            Numbered 06 through 16. Every card opens a working product, not a
            mockup.
          </p>
        </Reveal>

        <div className="index-grid">
          {INDEX_ITEMS.map((it, i) => (
            <motion.a
              key={it.n}
              className="index-card"
              href={it.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 22,
                delay: (i % 3) * 0.05,
              }}
            >
              <div className="index-thumb">
                <img
                  src={it.img}
                  alt={`${it.name} screenshot`}
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="400"
                />
              </div>
              <div className="index-body">
                <div className="index-meta">
                  <span className="index-num mono">{it.n}</span>
                  <span className="index-name">{it.name}</span>
                  <span className="index-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <p className="index-line">{it.line}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
