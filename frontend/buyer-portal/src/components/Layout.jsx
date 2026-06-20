
import Sidebar from './common/Sidebar'
import Header from './common/Header'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 px-2 sm:px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
