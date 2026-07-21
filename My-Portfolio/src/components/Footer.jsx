import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { profile } from '../data/siteData.js'

const socialLinks = [
  { label: 'GitHub', href: profile.github, icon: FiGithub },
  { label: 'LinkedIn', href: profile.linkedin, icon: FiLinkedin },
  { label: 'Email', href: `mailto:${profile.email}`, icon: FiMail },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>Built with React, Vite, Tailwind CSS, and Framer Motion.</p>
      <div className="footer-links">
        {socialLinks.map((link) => {
          const Icon = link.icon

          return (
            <a key={link.label} href={link.href} aria-label={link.label} target="_blank" rel="noreferrer">
              <Icon aria-hidden="true" />
            </a>
          )
        })}
      </div>
    </footer>
  )
}
