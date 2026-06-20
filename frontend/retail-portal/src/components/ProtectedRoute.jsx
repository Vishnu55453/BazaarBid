import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Account...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // Dual role check: only 'kirana_user' allowed
  if (user && user.role !== 'kirana_user') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm shadow-rose-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">Access Restriced</h2>
          
          <p className="text-slate-500 text-sm leading-relaxed">
            This merchant portal is dedicated strictly to verified local **Kirana Retailers**. Your current role is <strong className="text-slate-800">{user.role}</strong>.
          </p>

          <div className="mt-4 flex gap-4 w-full">
            <button
              onClick={logout}
              className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 shadow-md shadow-slate-200 transition-all duration-300"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
