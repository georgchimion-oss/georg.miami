import { MotionConfig } from 'framer-motion'
import AmbientWash from './components/AmbientWash.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import CredStrip from './components/CredStrip.jsx'
import Marquee from './components/Marquee.jsx'
import Flagships from './components/Flagships.jsx'
import IndexGrid from './components/IndexGrid.jsx'
import Audits from './components/Audits.jsx'
import Approach from './components/Approach.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AmbientWash />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <CredStrip />
        <Marquee />
        <Flagships />
        <IndexGrid />
        <Audits />
        <Approach />
      </main>
      <Footer />
    </MotionConfig>
  )
}
