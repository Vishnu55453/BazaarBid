import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'

// Markets will be fetched from API

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [gstError, setGstError] = useState('')
  const [marketOptions, setMarketOptions] = useState([])
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    shopName: '',
    gstNumber: '',
    marketName: '',
    city: '',
    pincode: ''
  })

  useEffect(() => {
    if (!isLogin) {
      api.get('/api/masters/markets')
        .then(res => {
          setMarketOptions(res)
          if (res.length > 0) {
            setFormData(prev => ({ ...prev, marketName: res[0].marketId }))
          }
        })
        .catch(err => console.error('Failed to load markets', err))
    }
  }, [isLogin])

  const handleChange = (e) => {
    const { name, value } = e.target
    const newVal = name === 'gstNumber' ? value.toUpperCase() : value
    setFormData((prev) => ({ ...prev, [name]: newVal }))
    if (name === 'gstNumber') {
      setGstError(newVal && !GST_REGEX.test(newVal) ? 'Invalid GST format (e.g. 27AAPFU0939F1ZV)' : '')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
        toast.success('Welcome back to the Seller Portal!')
        navigate('/')
      } else {
        // Validations
        if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
          throw new Error('Please enter a valid 6-digit Pincode')
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
          throw new Error('Please enter a valid 10-digit Phone number')
        }
        if (!formData.gstNumber) {
          throw new Error('GST Number is required for seller verification')
        }
        if (!GST_REGEX.test(formData.gstNumber)) {
          throw new Error('Please enter a valid 15-character GST Number')
        }

        const payload = {
          name: formData.shopName,   // use shop name as the account display name
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'big_market_seller',
          location: {
            city: formData.city,
            pincode: formData.pincode,
            area: formData.marketName
          },
          bigMarketProfile: {
            shopName: formData.shopName,
            gstNumber: formData.gstNumber,
            marketName: formData.marketName,
            isVerified: false
          }
        }

        await register(payload)
        toast.success('Registration successful! Welcome to the Big Market Seller Portal!')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition'
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-8 bg-white border border-slate-200 shadow-xl rounded-[32px] overflow-hidden p-6 md:p-8">

        {/* Left decoration panel */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-100">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-sm font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit">
              BAZAARBID SELLER
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-4">
              Wholesaler Marketplace.
            </h2>
            <p className="text-slate-200 text-xs leading-relaxed mt-2 font-medium">
              Manage your bulk orders, post open auctions, and track your revenue — all in one powerful portal tailored for big market sellers.
            </p>
          </div>

          {/* GST badge */}
          {!isLogin && (
            <div className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-4 mt-6">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">🔐 GST Verified Sellers</p>
              <p className="text-white text-xs leading-relaxed">
                We collect your GST number to verify your identity, generate compliant tax invoices, and keep fake sellers off the platform.
              </p>
            </div>
          )}
        </div>

        {/* Right Form panel */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center px-2 py-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Seller Portal</p>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                {isLogin ? 'Seller Login' : 'Register Shop'}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setGstError('') }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Registration-only fields ── */}
            {!isLogin && (
              <>
                {/* Shop / Business Name */}
                <div>
                  <label className={labelCls}>Shop / Business Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required className={inputCls} placeholder="Patil Agro Traders" />
                </div>

                {/* GST Number */}
                <div>
                  <label className={labelCls}>
                    GST Number <span className="text-red-500">*</span>
                    <span className="ml-1 normal-case font-normal text-slate-400">(required for invoice & verification)</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    required
                    maxLength={15}
                    placeholder="27AAPFU0939F1ZV"
                    className={`${inputCls} font-mono tracking-widest ${gstError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  {gstError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{gstError}</p>
                  )}
                  {!gstError && formData.gstNumber.length === 15 && (
                    <p className="text-xs text-emerald-600 mt-1 font-bold">✓ Valid GST format</p>
                  )}
                </div>

              </>
            )}

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className={isLogin ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                <label className={labelCls}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputCls} placeholder="you@example.com" />
              </div>
              {!isLogin && (
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} className={inputCls} placeholder="10-digit number" />
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className={inputCls} placeholder="Min. 6 characters" />
            </div>

            {/* Registration location fields */}
            {!isLogin && (
              <>
                <div>
                  <label className={labelCls}>Market</label>
                  <select name="marketName" value={formData.marketName} onChange={handleChange} className={inputCls}>
                    {marketOptions.map(o => <option key={o.marketId} value={o.marketId}>{o.name} ({o.city})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className={inputCls} placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className={labelCls}>Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6} className={inputCls} placeholder="400703" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !!gstError)}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3 mt-2 transition shadow-md shadow-blue-200"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Seller Account'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
