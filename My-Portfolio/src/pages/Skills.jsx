import { motion } from 'framer-motion'
import SectionHeader from '../components/SectionHeader.jsx'
import { skillGroups } from '../data/siteData.js'

export default function Skills() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Skills"
          description="A practical stack for student projects, internship tasks, and steady growth across web, mobile, backend, databases, and tools."
        />
        <div className="skills-grid">
          {skillGroups.map((group) => {
            const GroupIcon = group.icon

            return (
              <article key={group.title} className="skill-group">
                <div className="group-heading">
                  <GroupIcon aria-hidden="true" />
                  <h2>{group.title}</h2>
                </div>
                <div className="skill-list">
                  {group.skills.map((skill) => {
                    const SkillIcon = skill.icon

                    return (
                      <div key={skill.name} className="skill-row">
                        <div className="skill-meta">
                          <SkillIcon aria-hidden="true" />
                          <span>{skill.name}</span>
                          <strong>{skill.level}%</strong>
                        </div>
                        <div className="progress-track">
                          <motion.span
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: skill.level / 100 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
