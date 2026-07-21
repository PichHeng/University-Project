import { motion } from 'framer-motion'

export default function TimelineItem({ item }) {
  const Icon = item.icon

  return (
    <motion.article
      className="timeline-item"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="timeline-dot">{Icon ? <Icon aria-hidden="true" /> : null}</div>
      <div>
        <span className="meta-text">{item.duration || item.period}</span>
        <h2>{item.title || item.school}</h2>
        <strong>{item.organization || item.degree}</strong>
        <p>{item.description || item.details}</p>
        {item.achievements ? (
          <ul className="tag-list">
            {item.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.article>
  )
}
