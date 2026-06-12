import { Link, Outlet, useLocation } from 'react-router-dom'
import FloatingPetals from './FloatingPetals'

export default function Layout() {
  const location = useLocation()
  const isCard = location.pathname.startsWith('/card/')

  return (
    <div className="min-h-dvh flex flex-col">
      <FloatingPetals count={isCard ? 25 : 12} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-xs text-pink-300">
        Made with ❤️ by 元英小铺
      </footer>
    </div>
  )
}
