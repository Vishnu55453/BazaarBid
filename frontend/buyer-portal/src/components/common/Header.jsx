import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../hooks/useCart'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const { cartCount, total } = useCart()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 h-16 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold tracking-widest text-indigo-700">BAZAARBID</span>
        <span className="hidden md:inline text-xs text-slate-400">Buyer portal</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cart')}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200"
        >
          Cart ({cartCount}) • ₹{total}
        </button>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
