import SectionHeader from '../components/SectionHeader.jsx'
import TimelineItem from '../components/TimelineItem.jsx'
import { experience } from '../data/siteData.js'

export default function Experience() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Experience"
          description="A timeline of internship preparation, university projects, volunteer activity, and collaboration."
        />
        <div className="timeline">
          {experience.map((item) => (
            <TimelineItem key={`${item.organization}-${item.duration}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
