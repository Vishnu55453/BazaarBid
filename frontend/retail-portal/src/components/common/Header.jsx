import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const shopName = user?.kiranaProfile?.asSeller?.shopName || 'Local Kirana Shop'

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 h-16 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100">
          BAZAARBID
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
          Kirana Portal
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Wallet Balance widget */}
        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50/60 border border-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-900 shadow-sm shadow-indigo-50/20">
          <span className="text-indigo-500 font-medium">Wallet:</span>
          <span>₹{user?.walletBalance ?? 0}</span>
        </div>

        <NotificationBell />

        {/* User Card */}
        <div className="flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200/70 p-1 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-100">
            {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'K'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{shopName}</p>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-[10px]">★</span>
              <p className="text-[10px] text-slate-500 font-bold">{user?.rating?.average || 0}</p>
              <span className="text-[9px] text-slate-400">({user?.rating?.count || 0})</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1 text-[11px] font-bold text-slate-600 hover:text-rose-700 transition-all duration-300 ml-1.5 shadow-sm shadow-slate-100/50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
