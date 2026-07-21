import SectionHeader from '../components/SectionHeader.jsx'
import TimelineItem from '../components/TimelineItem.jsx'
import { coursework, education, journey } from '../data/siteData.js'

export default function Education() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="Education"
          description="Academic foundation, important milestones, and coursework connected to software engineering practice."
        />
        <div className="split-layout">
          <div className="timeline compact-timeline">
            {education.map((item) => (
              <TimelineItem key={item.degree} item={item} />
            ))}
            {journey.map((item) => (
              <TimelineItem key={item.title} item={item} />
            ))}
          </div>
          <aside className="coursework-panel">
            <h2>Relevant coursework</h2>
            <ul className="check-list">
              {coursework.map((course) => (
                <li key={course}>{course}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
