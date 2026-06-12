import { Outlet, useLocation } from 'react-router-dom'
import FloatingPetals from './FloatingPetals'
import BackgroundMusic, { tryStartMusic } from './BackgroundMusic'
import { useEffect, useState } from 'react'
import { getTheme, loadTheme } from '../lib/theme'

export default function Layout() {
  const location = useLocation()
  const isCard = location.pathname.startsWith('/card/')
  const [theme, setTheme] = useState(getTheme(loadTheme()))

  // Listen for theme changes from sessionStorage
  useEffect(() => {
    const check = () => {
      const t = getTheme(loadTheme())
      setTheme(t)
    }
    // Check on route change
    check()
    // Also listen for storage events
    const interval = setInterval(check, 500)
    return () => clearInterval(interval)
  }, [location])

  useEffect(() => {
    const start = () => {
      tryStartMusic()
      document.removeEventListener('touchstart', start)
      document.removeEventListener('click', start)
    }
    document.addEventListener('touchstart', start, { once: true })
    document.addEventListener('click', start, { once: true })
    return () => {
      document.removeEventListener('touchstart', start)
      document.removeEventListener('click', start)
    }
  }, [])

  return (
    <div className="min-h-dvh flex flex-col transition-all duration-500" style={{ background: theme.bg }}>
      <FloatingPetals count={isCard ? 25 : 12} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-xs" style={{ color: theme.primaryLight }}>
        Made with ❤️ by 元英小铺
      </footer>
      <BackgroundMusic />
    </div>
  )
}
