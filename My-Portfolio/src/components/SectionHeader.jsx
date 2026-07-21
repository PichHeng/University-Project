import { motion } from 'framer-motion'

export default function SectionHeader({ title, description, align = 'left' }) {
  return (
    <motion.div
      className={`section-header ${align === 'center' ? 'mx-auto text-center' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
    >
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </motion.div>
  )
}
