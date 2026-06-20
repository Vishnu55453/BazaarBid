import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const MARKETS = [
  { value: 'vashi_veg', label: 'Vashi Vegetable Market' },
  { value: 'vashi_fruit', label: 'Vashi Fruit Market' },
  { value: 'byculla_fruit', label: 'Byculla Fruit Market' },
  { value: 'vashi_dry_fruit', label: 'Vashi Dry Fruits Market' },
  { value: 'any', label: 'Any Available Market' }
]

// Auction schema unit enum: ['kg', 'gram', 'litre', 'dozen', 'piece', 'box']
const UNITS = ['kg', 'gram', 'litre', 'dozen', 'piece', 'box']

// Auction category is a free-text string (no enum), use readable labels as values
const CATEGORY_OPTIONS = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fresh_fruits', label: 'Fresh Fruits' },
  { value: 'dry_fruits', label: 'Dry Fruits' },
  { value: 'dairy', label: 'Dairy & Eggs' },
  { value: 'grocery', label: 'Grocery & Staples' },
  { value: 'rice_wheat', label: 'Rice, Wheat & Grains' },
  { value: 'spices', label: 'Spices & Masala' },
  { value: 'snacks', label: 'Snacks & Namkeen' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'oils', label: 'Oils & Ghee' },
  { value: 'bakery', label: 'Bakery & Bread' },
  { value: 'meat_fish', label: 'Meat & Fish' },
  { value: 'sugar_jaggery', label: 'Sugar & Jaggery' },
  { value: 'pickles_papad', label: 'Pickles & Papad' },
  { value: 'frozen_foods', label: 'Frozen Foods' },
  { value: 'other', label: 'Other' },
]

const GRADES = ['Premium', 'Standard', 'A Grade', 'B Grade']

const STEP_LABELS = ['Product', 'Quality', 'Delivery', 'Budget & Timing']

export default function CreateAuction() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const shopName = user?.kiranaProfile?.asSeller?.shopName || 'My Shop'
  const city = user?.location?.city || ''
  const pincode = user?.location?.pincode || ''

  const [form, setForm] = useState({
    productName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    qualitySpecs: {
      grade: 'Standard',
      organic: false,
      freshness: '',
      packaging: 'Loose',
      customRequirements: ''
    },
    preferredMarket: 'any',
    deliveryAddress: {
      shopName: shopName,
      area: '',
      city: city,
      pincode: pincode,
      landmark: '',
      fullAddress: ''
    },
    deliveryTimeline: 2,
    budgetRange: { min: '', max: '' },
    endTime: '',
    autoAward: true
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const setNested = (parent, field, value) => setForm(prev => ({
    ...prev,
    [parent]: { ...prev[parent], [field]: value }
  }))

  const stepValid = () => {
    if (step === 0) return form.productName && form.category && form.quantity && form.unit
    if (step === 1) return true
    if (step === 2) return form.preferredMarket && form.deliveryAddress.area && form.deliveryAddress.city && form.deliveryAddress.pincode && form.deliveryTimeline
    if (step === 3) return form.endTime
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        deliveryTimeline: Number(form.deliveryTimeline),
        budgetRange: {
          min: form.budgetRange.min ? Number(form.budgetRange.min) : undefined,
          max: form.budgetRange.max ? Number(form.budgetRange.max) : undefined
        }
      }
      const res = await api.post('/api/auctions', payload)
      if (res.success || res.auction) {
        toast.success('Bulk auction created! Suppliers will start bidding shortly.')
        navigate('/buyer/auctions')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create auction')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'
  const labelClass = 'block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5'

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Bulk Buyer Desk</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Bulk Auction</h1>
        <p className="text-slate-500 text-sm mt-1">Broadcast your requirement to wholesale suppliers across major markets.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all duration-300 border-2
                  ${i < step ? 'bg-indigo-600 border-indigo-600 text-white cursor-pointer' :
                    i === step ? 'bg-white border-indigo-600 text-indigo-600' :
                      'bg-slate-100 border-slate-200 text-slate-400 cursor-default'}`}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </button>
              <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block ${i === step ? 'text-indigo-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${i < step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-100/50 p-6 sm:p-8">

        {/* Step 0: Product Details */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-base font-black text-slate-800">What do you need to buy?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input className={inputClass} placeholder="E.g. Fresh Tomatoes, Basmati Rice..." value={form.productName}
                  onChange={e => set('productName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select className={inputClass} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input type="number" min="1" className={inputClass} placeholder="100" value={form.quantity}
                    onChange={e => set('quantity', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Unit *</label>
                  <select className={inputClass} value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Quality Specs */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-black text-slate-800">Quality Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Grade</label>
                <select className={inputClass} value={form.qualitySpecs.grade} onChange={e => setNested('qualitySpecs', 'grade', e.target.value)}>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Packaging</label>
                <select className={inputClass} value={form.qualitySpecs.packaging} onChange={e => setNested('qualitySpecs', 'packaging', e.target.value)}>
                  {['Loose', 'Box', 'Bag', 'Crate'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Freshness Requirement</label>
                <input className={inputClass} placeholder="E.g. Harvested today, 1-day fresh" value={form.qualitySpecs.freshness}
                  onChange={e => setNested('qualitySpecs', 'freshness', e.target.value)} />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setNested('qualitySpecs', 'organic', !form.qualitySpecs.organic)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all duration-200
                    ${form.qualitySpecs.organic ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 transition-all ${form.qualitySpecs.organic ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`} />
                  Organic Only
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Custom Requirements</label>
                <textarea rows={3} className={inputClass} placeholder="Any special instructions for suppliers..."
                  value={form.qualitySpecs.customRequirements}
                  onChange={e => setNested('qualitySpecs', 'customRequirements', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-black text-slate-800">Delivery Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Preferred Market *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {MARKETS.map(m => (
                    <button key={m.value} type="button"
                      onClick={() => set('preferredMarket', m.value)}
                      className={`text-left px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-200
                        ${form.preferredMarket === m.value ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Shop Name</label>
                <input className={inputClass} value={form.deliveryAddress.shopName}
                  onChange={e => setNested('deliveryAddress', 'shopName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Area / Locality *</label>
                <input className={inputClass} placeholder="E.g. Sector 7, Kharghar" value={form.deliveryAddress.area}
                  onChange={e => setNested('deliveryAddress', 'area', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input className={inputClass} value={form.deliveryAddress.city}
                  onChange={e => setNested('deliveryAddress', 'city', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input className={inputClass} maxLength={6} value={form.deliveryAddress.pincode}
                  onChange={e => setNested('deliveryAddress', 'pincode', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Delivery Within (Days) *</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {[1, 2, 3, 4, 5, 7].map(d => (
                    <button key={d} type="button"
                      onClick={() => set('deliveryTimeline', d)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                        ${form.deliveryTimeline === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    >
                      {d} Day{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Timing */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-black text-slate-800">Budget & Auction Timing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Min Budget / Unit (₹)</label>
                <input type="number" min="0" className={inputClass} placeholder="Optional lower bound" value={form.budgetRange.min}
                  onChange={e => setNested('budgetRange', 'min', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Max Budget / Unit (₹)</label>
                <input type="number" min="0" className={inputClass} placeholder="Your highest acceptable price" value={form.budgetRange.max}
                  onChange={e => setNested('budgetRange', 'max', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Auction Closes At *</label>
                <input type="datetime-local" className={inputClass} value={form.endTime}
                  min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                  onChange={e => set('endTime', e.target.value)} />
                <p className="text-[11px] text-slate-400 mt-1">Suppliers can bid until this time. After closing, the lowest bid wins.</p>
              </div>
              <div className="sm:col-span-2">
                <div className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${form.autoAward ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                  onClick={() => set('autoAward', !form.autoAward)}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">Auto-Award to Lowest Bidder</p>
                    <p className="text-xs text-slate-500 mt-0.5">Winner is automatically selected when auction closes</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0
                    ${form.autoAward ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300
                      ${form.autoAward ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-black text-indigo-800 uppercase tracking-wider">Auction Summary</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <span className="text-slate-500">Product:</span><span className="font-bold text-slate-800">{form.productName || '—'}</span>
                <span className="text-slate-500">Quantity:</span><span className="font-bold text-slate-800">{form.quantity} {form.unit}</span>
                <span className="text-slate-500">Market:</span><span className="font-bold text-slate-800">{MARKETS.find(m => m.value === form.preferredMarket)?.label || '—'}</span>
                <span className="text-slate-500">Delivery:</span><span className="font-bold text-slate-800">Within {form.deliveryTimeline} day(s)</span>
                {form.budgetRange.max && <><span className="text-slate-500">Max Budget:</span><span className="font-bold text-emerald-700">₹{form.budgetRange.max}/unit</span></>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/buyer/auctions')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              onClick={() => stepValid() && setStep(step + 1)}
              disabled={!stepValid()}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm px-6 py-2.5 transition shadow-lg shadow-indigo-100"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !stepValid()}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 text-white font-bold text-sm px-6 py-2.5 transition shadow-lg shadow-indigo-100"
            >
              {loading ? 'Creating...' : 'Launch Auction'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
