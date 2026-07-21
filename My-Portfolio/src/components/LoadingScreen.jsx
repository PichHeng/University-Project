import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="loader-screen" role="status" aria-label="Loading page">
      <motion.div
        className="loader-mark"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
