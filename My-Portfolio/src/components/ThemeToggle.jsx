import { FiMoon, FiSun } from 'react-icons/fi'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="icon-button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={onToggle}
    >
      {isDark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
    </button>
  )
}
