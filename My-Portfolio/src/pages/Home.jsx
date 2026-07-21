import { motion } from 'framer-motion'
import { FiDownload, FiMail } from 'react-icons/fi'
import { ButtonLink } from '../components/Button.jsx'
import HeroVisual from '../components/HeroVisual.jsx'
import ParticleField from '../components/ParticleField.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { focusAreas, profile, projects, stats } from '../data/siteData.js'

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <ParticleField />
        <div className="page-container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <h1>{profile.name}</h1>
            <h2>{profile.role}</h2>
            <p>{profile.tagline}</p>
            <div className="hero-actions">
              <ButtonLink href="/resume.txt" download="Tween-Resume.txt" icon={FiDownload}>
                Download Resume
              </ButtonLink>
              <ButtonLink to="/contact" variant="secondary" icon={FiMail}>
                Contact Me
              </ButtonLink>
            </div>
          </motion.div>
          <HeroVisual />
        </div>
      </section>

      <section className="section-band">
        <div className="page-container stats-grid">
          {stats.map((stat) => (
            <motion.article
              key={stat.label}
              className="stat-card"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="page-container split-layout">
          <SectionHeader
            title="Building toward practical software work."
            description="I am shaping a project portfolio around clear interfaces, maintainable code, and the habits expected from internship-ready developers."
          />
          <div className="focus-list">
            {focusAreas.map((area) => (
              <article key={area}>
                <span />
                <p>{area}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section compact-section">
        <div className="page-container">
          <SectionHeader
            title="Featured projects"
            description="A quick look at academic, mobile, and web work that shows how I solve problems."
          />
          <div className="mini-project-grid">
            {projects.slice(0, 3).map((project) => (
              <article key={project.title} className="mini-project">
                <span>{project.image}</span>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
