import { motion } from 'framer-motion'
import { FiExternalLink, FiGithub } from 'react-icons/fi'

export default function ProjectCard({ project }) {
  return (
    <motion.article
      className="project-card"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35 }}
    >
      <div className="project-image" aria-hidden="true">
        <span>{project.image}</span>
      </div>
      <div className="project-content">
        <span className="meta-text">{project.category}</span>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <ul className="tag-list">
          {project.tech.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <div className="card-actions">
          <a href={project.github} target="_blank" rel="noreferrer">
            <FiGithub aria-hidden="true" />
            GitHub
          </a>
          <a href={project.demo} target="_blank" rel="noreferrer">
            <FiExternalLink aria-hidden="true" />
            Live Demo
          </a>
        </div>
      </div>
    </motion.article>
  )
}
