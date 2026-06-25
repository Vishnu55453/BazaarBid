import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const AuthPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [isPendingVerification, setIsPendingVerification] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        const res = await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'normal_buyer'
        })
        if (!res.token) {
          setIsPendingVerification(true)
          return
        }
      }

      navigate('/products')
    } catch (error) {
      if (error.message?.toLowerCase().includes('pending verification')) {
        setIsPendingVerification(true)
        return
      }
      toast.error(error.message || 'Unable to process request')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  if (isPendingVerification) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-8">
        <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
            <svg className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verification Pending</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Your account has been successfully created and is currently under review by our administration team. You will be able to access the portal once verified.
          </p>
          <button
            onClick={() => {
              setIsPendingVerification(false)
              setMode('login')
            }}
            className="mt-8 rounded-full border border-slate-200 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-2 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="bg-slate-900 p-8 text-white sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Buyer portal</p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Shop local, compare fast, and checkout with confidence.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Browse fresh products, save your cart, track orders, and manage your profile from one guided portal.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Flexible product search and seller filters',
                'Secure checkout with delivery details',
                'Order tracking and profile controls'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-100">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Portal access</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {mode === 'login' ? 'Buyer login' : 'Buyer registration'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-200"
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Full name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required={mode === 'register'}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
