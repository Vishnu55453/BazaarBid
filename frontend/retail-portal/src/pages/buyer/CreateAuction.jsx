import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

// Dynamic categories and markets
const UNITS = ['kg', 'gram', 'litre', 'dozen', 'piece', 'box']

const GRADES = ['Premium', 'Standard', 'A Grade', 'B Grade']

export default function CreateAuction() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [expandedSections, setExpandedSections] = useState([0])
  const [loading, setLoading] = useState(false)
  const [marketOptions, setMarketOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [isCustomDelivery, setIsCustomDelivery] = useState(false)

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [marketsRes, catsRes] = await Promise.all([
          api.get('/api/masters/markets'),
          api.get('/api/masters/categories')
        ])
        setMarketOptions([{ marketId: 'any', name: 'Any Available Market' }, ...marketsRes])
        setCategoryOptions(catsRes)
      } catch (error) {
        console.error('Failed to load masters:', error)
      }
    }
    fetchMasters()
  }, [])

  const shopName = user?.kiranaProfile?.asSeller?.shopName || 'My Shop'
  const city = user?.location?.city || ''
  const pincode = user?.location?.pincode || ''
  const area = user?.location?.area || ''

  const [form, setForm] = useState({
    items: [{
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
      budgetRange: { min: '', max: '' }
    }],
    allowPartialBids: false,
    preferredMarket: 'any',
    deliveryAddress: {
      shopName: shopName,
      area: area,
      city: city,
      pincode: pincode,
      landmark: '',
      fullAddress: ''
    },
    deliveryTimeline: 2,
    endTime: '',
    autoAward: true,
    minRatingRequired: 0
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  
  const setNested = (parent, field, value) => {
    setForm(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const setItem = (index, field, value) => {
    const newItems = [...form.items]
    newItems[index][field] = value
    setForm({ ...form, items: newItems })
  }

  const setItemNested = (index, parent, field, value) => {
    const newItems = [...form.items]
    newItems[index][parent] = { ...newItems[index][parent], [field]: value }
    setForm({ ...form, items: newItems })
  }

  const addItem = () => {
    if (form.items.length >= 4) {
      toast.error('You can only add up to 4 items per auction.')
      return
    }
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          productName: '',
          category: '',
          quantity: '',
          unit: 'kg',
          qualitySpecs: { grade: 'Standard', organic: false, freshness: '', packaging: 'Loose', customRequirements: '' },
          budgetRange: { min: '', max: '' }
        }
      ]
    })
  }

  const removeItem = (index) => {
    if (form.items.length === 1) return
    const newItems = form.items.filter((_, i) => i !== index)
    setForm({ ...form, items: newItems })
  }

  const toggleSection = (idx) => setExpandedSections(prev =>
    prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
  )

  const isFormValid = () => {
    const itemsValid = form.items.every(item => item.productName && item.category && item.quantity && item.unit)
    return itemsValid && form.preferredMarket && form.deliveryAddress.area && form.deliveryAddress.city &&
      form.deliveryAddress.pincode && form.deliveryTimeline && form.endTime
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        items: form.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          budgetRange: {
            min: item.budgetRange.min ? Number(item.budgetRange.min) : undefined,
            max: item.budgetRange.max ? Number(item.budgetRange.max) : undefined
          }
        })),
        deliveryTimeline: Number(form.deliveryTimeline)
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
    <div className="space-y-6 pb-12 w-full max-w-8xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Bulk Buyer Desk</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Bulk Auction</h1>
        <p className="text-slate-500 text-sm mt-1">Broadcast your requirement to wholesale suppliers across major markets.</p>
      </div>

      <div className="">

        {/* Step 0: Product Details */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">
          <button type="button" onClick={() => toggleSection(0)} className="w-full bg-slate-50/50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">1</span>
              <h2 className="text-base font-black text-slate-800">Product Details</h2>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.includes(0) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {expandedSections.includes(0) && (
            <div className="p-6 border-t border-slate-200 space-y-6 bg-white">
              <div className="space-y-8">
                {form.items.map((item, index) => (
                  <div key={index} className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm">
                    {form.items.length > 1 && (
                      <div className="absolute -top-3 -right-3">
                        <button type="button" onClick={() => removeItem(index)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition shadow-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">Item {index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                        <input className={inputClass} placeholder="E.g. Fresh Tomatoes, Basmati Rice..." value={item.productName}
                          onChange={e => setItem(index, 'productName', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                        <select className={inputClass} value={item.category} onChange={e => setItem(index, 'category', e.target.value)}>
                          <option value="">Select category</option>
                          {categoryOptions.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                          <input type="number" min="1" className={inputClass} placeholder="100" value={item.quantity}
                            onChange={e => setItem(index, 'quantity', e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Unit <span className="text-red-500">*</span></label>
                          <select className={inputClass} value={item.unit} onChange={e => setItem(index, 'unit', e.target.value)}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Packaging</label>
                        <select className={inputClass} value={item.qualitySpecs.packaging} onChange={e => setItemNested(index, 'qualitySpecs', 'packaging', e.target.value)}>
                          {['Loose', 'Box', 'Bag', 'Crate', 'Carton', 'Plastic Tray', 'Gunny Bag (Bori)'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Custom Requirements / Details</label>
                        <textarea rows={2} className={inputClass} placeholder="Any special instructions or quality details for suppliers..."
                          value={item.qualitySpecs.customRequirements}
                          onChange={e => setItemNested(index, 'qualitySpecs', 'customRequirements', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Target Budget / Unit (₹) <span className="text-slate-400 normal-case font-medium ml-1">(Optional)</span></label>
                        <input type="number" min="0" className={inputClass} placeholder={`Max price per ${item.unit}`} value={item.budgetRange.max}
                          onChange={e => setItemNested(index, 'budgetRange', 'max', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {form.items.length < 4 && (
                <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Another Item
                </button>
              )}

              {form.items.length > 1 && (
                <div className="mt-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-start gap-3">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      id="allowPartialBids"
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      checked={form.allowPartialBids}
                      onChange={e => set('allowPartialBids', e.target.checked)}
                    />
                  </div>
                  <div>
                    <label htmlFor="allowPartialBids" className="text-sm font-bold text-slate-800 block cursor-pointer">Allow Partial Bids</label>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      If checked, suppliers can bid on specific items instead of fulfilling the entire auction. 
                      You will be able to award different items to different suppliers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 1: Delivery */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">
          <button type="button" onClick={() => toggleSection(1)} className="w-full bg-slate-50/50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">2</span>
              <h2 className="text-base font-black text-slate-800">Delivery Preferences</h2>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.includes(1) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {expandedSections.includes(1) && (
            <div className="p-6 border-t border-slate-200 space-y-5 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Preferred Market <span className="text-red-500">*</span></label>
                  <select className={inputClass} value={form.preferredMarket} onChange={e => set('preferredMarket', e.target.value)}>
                    {marketOptions.map(m => (
                      <option key={m.marketId} value={m.marketId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Shop Name</label>
                  <input className={inputClass} value={form.deliveryAddress.shopName}
                    onChange={e => setNested('deliveryAddress', 'shopName', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Area / Locality <span className="text-red-500">*</span></label>
                  <input className={inputClass} placeholder="E.g. Sector 7, Kharghar" value={form.deliveryAddress.area}
                    onChange={e => setNested('deliveryAddress', 'area', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>City <span className="text-red-500">*</span></label>
                  <input className={inputClass} value={form.deliveryAddress.city}
                    onChange={e => setNested('deliveryAddress', 'city', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Pincode <span className="text-red-500">*</span></label>
                  <input className={inputClass} maxLength={6} value={form.deliveryAddress.pincode}
                    onChange={e => setNested('deliveryAddress', 'pincode', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Delivery Within (Days) <span className="text-red-500">*</span></label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-1">
                    <select 
                      className={`${inputClass} sm:w-1/2`}
                      value={isCustomDelivery ? 'other' : form.deliveryTimeline}
                      onChange={e => {
                        if (e.target.value === 'other') {
                          setIsCustomDelivery(true)
                          set('deliveryTimeline', '')
                        } else {
                          setIsCustomDelivery(false)
                          set('deliveryTimeline', Number(e.target.value))
                        }
                      }}
                    >
                      {[1, 2, 3, 4, 5, 7].map(d => (
                        <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>

                    {isCustomDelivery && (
                      <div className="relative sm:w-1/2">
                        <input 
                          type="number" 
                          min="1" 
                          max="30"
                          className={`${inputClass} pr-12`} 
                          placeholder="Enter number of days"
                          value={form.deliveryTimeline}
                          onChange={e => set('deliveryTimeline', e.target.value)} 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                          Days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Budget & Timing */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">
          <button type="button" onClick={() => toggleSection(2)} className="w-full bg-slate-50/50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">3</span>
              <h2 className="text-base font-black text-slate-800">Budget & Auction Timing</h2>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.includes(2) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {expandedSections.includes(2) && (
            <div className="p-6 border-t border-slate-200 space-y-5 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2">
                  <label className={labelClass}>Auction Closes At <span className="text-red-500">*</span></label>
                  <input type="datetime-local" className={inputClass} value={form.endTime}
                    min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                    onChange={e => set('endTime', e.target.value)} />
                  <p className="text-[11px] text-slate-400 mt-1">Suppliers can bid until this time. After closing, the lowest bid wins.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Minimum Seller Rating Required</label>
                  <select className={inputClass} value={form.minRatingRequired} onChange={e => set('minRatingRequired', e.target.value)}>
                    <option value="0">Any Rating (Open to all sellers)</option>
                    <option value="3">3+ Stars ⭐⭐⭐</option>
                    <option value="4">4+ Stars ⭐⭐⭐⭐</option>
                    <option value="5">5 Stars ⭐⭐⭐⭐⭐ (Top Rated Only)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Only sellers with this rating or higher will be able to see and bid on your auction.</p>
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
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2 mt-4">
                <p className="text-xs font-black text-indigo-800 uppercase tracking-wider">Auction Summary</p>
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-1.5 text-xs bg-white/50 p-2 rounded-lg">
                      <span className="text-slate-500">Item {index + 1}:</span>
                      <span className="font-bold text-slate-800">{item.productName || '—'}</span>
                      <span className="text-slate-500">Quantity:</span>
                      <span className="font-bold text-slate-800">{item.quantity} {item.unit}</span>
                      {item.budgetRange.max && (
                        <>
                          <span className="text-slate-500">Target Budget:</span>
                          <span className="font-bold text-emerald-700">₹{item.budgetRange.max}/unit</span>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-1.5 text-xs px-2 pt-2 border-t border-indigo-200">
                    <span className="text-slate-500">Bidding Mode:</span>
                    <span className="font-bold text-slate-800">
                      {form.allowPartialBids ? 'Partial Bids Allowed' : 'All Items Mandatory'}
                    </span>
                    <span className="text-slate-500">Market:</span>
                    <span className="font-bold text-slate-800">{marketOptions.find(m => m.marketId === form.preferredMarket)?.name || '—'}</span>
                    <span className="text-slate-500">Delivery:</span>
                    <span className="font-bold text-slate-800">Within {form.deliveryTimeline} day(s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => navigate('/buyer/auctions')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 text-white font-bold text-sm px-8 py-3 transition shadow-lg shadow-indigo-100"
          >
            {loading ? 'Creating...' : 'Launch Auction'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
