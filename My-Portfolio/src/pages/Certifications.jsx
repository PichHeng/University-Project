import { FiExternalLink } from 'react-icons/fi'
import SectionHeader from '../components/SectionHeader.jsx'
import { certifications } from '../data/siteData.js'

export default function Certifications() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Certifications"
          description="A compact credential area ready for verified links as new certificates are completed."
        />
        <div className="cert-grid">
          {certifications.map((certificate) => (
            <article key={certificate.name} className="cert-card">
              <span className="meta-text">{certificate.date}</span>
              <h2>{certificate.name}</h2>
              <p>{certificate.issuer}</p>
              <a href={certificate.link} target="_blank" rel="noreferrer">
                <FiExternalLink aria-hidden="true" />
                Credential Link
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
