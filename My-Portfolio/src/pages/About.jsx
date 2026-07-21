import SectionHeader from '../components/SectionHeader.jsx'
import TimelineItem from '../components/TimelineItem.jsx'
import { focusAreas, journey, profile } from '../data/siteData.js'

export default function About() {
  return (
    <section className="page-section">
      <div className="page-container">
        <SectionHeader
          title="About"
          description="A focused story about where I am, what I am learning, and the kind of software work I am preparing for."
        />
        <div className="split-layout">
          <div className="story-block">
            <h2>Personal story</h2>
            <p>
              I am a software engineering student who likes learning by building. My strongest motivation is
              creating projects that turn classroom concepts into interfaces, workflows, and systems that other
              people can actually use.
            </p>
            <p>
              My current objective is to earn an internship where I can contribute to real product work, learn
              from experienced engineers, and keep improving the craft of writing clean, reliable software.
            </p>
            <h2>Currently learning</h2>
            <ul className="check-list">
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
          <div className="story-block accent-panel">
            <h2>Future goals</h2>
            <p>{profile.summary}</p>
            <p>
              I want to grow into a developer who is trusted for thoughtful UI, dependable implementation, clear
              communication, and the patience to keep polishing until the work feels complete.
            </p>
          </div>
        </div>
        <div className="timeline">
          {journey.map((item) => (
            <TimelineItem key={item.period} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
