import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoadingScreen from './components/LoadingScreen.jsx'
import RootLayout from './layouts/RootLayout.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Skills = lazy(() => import('./pages/Skills.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const Experience = lazy(() => import('./pages/Experience.jsx'))
const Education = lazy(() => import('./pages/Education.jsx'))
const Certifications = lazy(() => import('./pages/Certifications.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="skills" element={<Skills />} />
            <Route path="projects" element={<Projects />} />
            <Route path="experience" element={<Experience />} />
            <Route path="education" element={<Education />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
