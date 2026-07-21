import { FiFacebook, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import ContactForm from '../components/ContactForm.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { contactMethods, profile } from '../data/siteData.js'

const socials = [
  { label: 'GitHub', href: profile.github, icon: FiGithub },
  { label: 'LinkedIn', href: profile.linkedin, icon: FiLinkedin },
  { label: 'Facebook', href: profile.facebook, icon: FiFacebook },
  { label: 'Email', href: `mailto:${profile.email}`, icon: FiMail },
]

export default function Contact() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Contact"
          description="Reach out for internships, entry-level opportunities, collaboration, or project feedback."
        />
        <div className="contact-layout">
          <div className="contact-panel">
            {contactMethods.map((method) => {
              const Icon = method.icon

              return (
                <a key={method.label} href={method.href}>
                  <Icon aria-hidden="true" />
                  <span>{method.label}</span>
                  <strong>{method.value}</strong>
                </a>
              )
            })}
            <div className="social-strip">
              {socials.map((social) => {
                const Icon = social.icon

                return (
                  <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
                    <Icon aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
