import { motion } from 'framer-motion'
import { FiCode, FiCpu, FiLayers } from 'react-icons/fi'
import heroLayer from '../assets/hero.png'

const codeLines = ['const goal = "internship";', 'build(projects);', 'ship(portfolio);']

export default function HeroVisual() {
  return (
    <motion.div
      className="hero-visual"
      initial={{ opacity: 0, scale: 0.95, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="profile-frame">
        <div className="profile-image" role="img" aria-label="Abstract developer portrait">
          <img src={heroLayer} alt="" loading="eager" />
          <span>T</span>
        </div>
      </div>
      <div className="floating-panel panel-code">
        {codeLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <div className="floating-panel panel-stack">
        <FiLayers aria-hidden="true" />
        <span>React + Flutter + C++</span>
      </div>
      <div className="orbit-item item-one">
        <FiCode aria-hidden="true" />
      </div>
      <div className="orbit-item item-two">
        <FiCpu aria-hidden="true" />
      </div>
    </motion.div>
  )
}
