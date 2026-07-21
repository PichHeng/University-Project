import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { profile } from '../data/siteData.js'
import { routes } from '../routes/routes.js'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark">T</span>
        <span>{profile.name}</span>
      </NavLink>

      <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        {routes.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          className="icon-button md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
