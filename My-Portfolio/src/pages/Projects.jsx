import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ProjectCard from '../components/ProjectCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { projects } from '../data/siteData.js'

const filters = ['All', 'Web', 'Mobile', 'C++', 'Academic']

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')
  const filteredProjects = useMemo(
    () =>
      activeFilter === 'All'
        ? projects
        : projects.filter((project) => project.category === activeFilter),
    [activeFilter],
  )

  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Projects"
          description="Filter through the work I am using to demonstrate C++, academic modeling, web UI, and mobile development."
        />
        <div className="filter-bar" aria-label="Project filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? 'is-active' : undefined}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="projects-grid">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
