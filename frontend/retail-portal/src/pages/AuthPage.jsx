import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isPendingVerification, setIsPendingVerification] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    shopName: '',
    gstNumber: '',
    city: '',
    pincode: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
        navigate('/')
      } else {
        // Validate pincode format
        if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
          throw new Error('Please enter a valid 6-digit Pincode')
        }
        // Validate phone format
        if (!/^[0-9]{10}$/.test(formData.phone)) {
          throw new Error('Please enter a valid 10-digit Phone number')
        }
        // Validate GST format if provided
        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
          throw new Error('Please enter a valid GST format (e.g. 22AAAAA0000A1Z5)')
        }

        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'kirana_user',
          location: {
            city: formData.city,
            pincode: formData.pincode
          },
          kiranaProfile: {
            asSeller: {
              shopName: formData.shopName
            },
            asBuyer: {
              gstNumber: formData.gstNumber || undefined
            }
          }
        }

        const response = await register(payload)
        
        if (!response.token) {
          setIsPendingVerification(true)
          return
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('pending verification')) {
        setIsPendingVerification(true)
        return
      }
      toast.error(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  if (isPendingVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-2 py-8">
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
              setIsLogin(true)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-8 bg-white border border-slate-200 shadow-xl rounded-[32px] overflow-hidden p-6 md:p-8">
        
        {/* Left decoration panel */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
          {/* Subtle backgrounds blur bubbles */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-sm font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit">
              BAZAARBID
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-4">
              Empowering India's Local Merchants.
            </h2>
            <p className="text-slate-200 text-xs leading-relaxed mt-2 font-medium">
              Operate as a wholesaler buyer and retail reseller in a single unified dashboard. Buy fresh products from big markets and resell them directly.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-100">Post Bulk Purchase Auctions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-100">Sell Retail in Locality</span>
            </div>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center px-2 py-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Kirana Portal
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                {isLogin ? 'Welcome Back!' : 'Create Shop Account'}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g. Vishnu Gawade"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    required
                    placeholder="E.g. Shiv Mandir Grocers"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className={isLogin ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@store.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {!isLogin && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="E.g. Mumbai"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      placeholder="400703"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 transition shadow-lg shadow-indigo-100 disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In to Portal' : 'Register Shop'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>By proceeding you agree to BazaarBid Merchant Guidelines.</span>
            <span>Need admin assistance? support@bazaarbid.com</span>
          </div>
        </div>
        
      </div>
    </div>
  )
}
