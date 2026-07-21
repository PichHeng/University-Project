import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BackToTop from '../components/BackToTop.jsx'
import CursorHalo from '../components/CursorHalo.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import { useTheme } from '../hooks/useTheme.js'

export default function RootLayout() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <CursorHalo />
      <ScrollProgress />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
