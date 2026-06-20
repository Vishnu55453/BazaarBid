import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

// Must exactly match Product.js schema enum values
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'ml', 'dozen', 'piece', 'box', 'bundle']

// Categories will be fetched from API

export default function AddProduct() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { user } = useAuth()
  const prefill = state?.prefill || null

  const [loading, setLoading] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState([])

  useEffect(() => {
    api.get('/api/masters/categories')
      .then(res => setCategoryOptions(res))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  const [form, setForm] = useState({
    name: prefill?.originalProductName || '',
    category: prefill?.category || '',
    subCategory: '',
    description: '',
    unit: prefill?.unit || 'kg',
    pricePerUnit: prefill?.purchasePrice ? Math.ceil(prefill.purchasePrice * 1.2) : '',
    compareAtPrice: '',
    stock: prefill?.stock || '',
    minimumOrderQty: 1,
    maximumOrderQty: '',
    bulkPricing: '',
    isOrganic: false,
    isAvailable: true,
    originalProductId: '',
    originalPurchasePrice: prefill?.purchasePrice ? Number(prefill.purchasePrice) : '',
    sourceSellerId: '',
    deliveryAvailable: true,
    deliveryCharges: 0,
    freeDeliveryAbove: '',
    tags: ''
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const parseBulkPricing = (rawValue) => {
    if (!rawValue?.trim()) {
      return []
    }

    const parsed = JSON.parse(rawValue)

    if (!Array.isArray(parsed)) {
      throw new Error('Bulk pricing must be a JSON array')
    }

    return parsed.map(item => ({
      minQuantity: Number(item.minQuantity),
      maxQuantity: item.maxQuantity === undefined || item.maxQuantity === null || item.maxQuantity === ''
        ? undefined
        : Number(item.maxQuantity),
      pricePerUnit: Number(item.pricePerUnit),
      discount: item.discount === undefined || item.discount === null || item.discount === ''
        ? undefined
        : Number(item.discount)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.pricePerUnit || !form.stock) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      let bulkPricing = []

      if (form.bulkPricing.trim()) {
        try {
          bulkPricing = parseBulkPricing(form.bulkPricing)
        } catch (error) {
          toast.error(error.message || 'Bulk pricing must be valid JSON')
          setLoading(false)
          return
        }
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        subCategory: form.subCategory.trim() || undefined,
        description: form.description,
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        bulkPricing,
        stock: Number(form.stock),
        minimumOrderQty: Number(form.minimumOrderQty) || 1,
        maximumOrderQty: form.maximumOrderQty ? Number(form.maximumOrderQty) : undefined,
        isOrganic: form.isOrganic,
        attributes: { organic: form.isOrganic },
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isAvailable: form.isAvailable,
        // Resale tracking (when listing from inventory)
        isResaleProduct: !!prefill,
        originalProductId: form.originalProductId || undefined,
        originalPurchasePrice: form.originalPurchasePrice ? Number(form.originalPurchasePrice) : null,
        sourceSellerId: form.sourceSellerId || undefined,
      }
      await api.post('/api/products', payload)
      toast.success('Product listed for retail sale!')
      navigate('/seller/products')
    } catch (err) {
      toast.error(err.message || 'Failed to list product')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'
  const labelClass = 'block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5'

  const suggestedPrice = prefill?.purchasePrice ? Math.ceil(prefill.purchasePrice * 1.2) : null
  const margin = form.pricePerUnit && prefill?.purchasePrice
    ? (((Number(form.pricePerUnit) - prefill.purchasePrice) / prefill.purchasePrice) * 100).toFixed(1)
    : null
  const selectedCategoryLabel = categoryOptions.find(c => c.categoryId === form.category)?.name || ''

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="rounded-xl bg-slate-100 hover:bg-slate-200 p-2 transition">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-0.5">Retail Seller Desk</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {prefill ? 'List Item from Stock' : 'Add Retail Product'}
          </h1>
        </div>
      </div>

      {/* Prefill notice */}
      {prefill && (
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-800">Auto-filled from your inventory</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">
              Sourced from wholesale auction · Cost ₹{prefill.purchasePrice}/{prefill.unit} · Available: {prefill.stock} {prefill.unit}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Details */}
        <div className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-100/50 p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Product Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Product Name *</label>
              <input className={inputClass} required placeholder="E.g. Fresh Tomatoes, Basmati Rice..."
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select className={inputClass} required value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {categoryOptions.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Unit *</label>
              <select className={inputClass} value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNIT_OPTIONS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={3} className={inputClass} placeholder="Short product description for buyers..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-100/50 p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Pricing & Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Retail Price / {form.unit} (₹) *</label>
              <input type="number" min="0" step="0.5" className={inputClass} required
                placeholder={suggestedPrice ? `Suggested: ₹${suggestedPrice}` : 'Enter price'}
                value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)} />
              {prefill?.purchasePrice && (
                <p className="text-[11px] mt-1 font-semibold">
                  {margin !== null ? (
                    <span className={Number(margin) > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {Number(margin) > 0 ? '↑' : '↓'} {Math.abs(margin)}% margin on cost ₹{prefill.purchasePrice}
                    </span>
                  ) : null}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Available Stock *</label>
              <input type="number" min="0" className={inputClass} required
                placeholder={prefill?.stock ? `Max: ${prefill.stock}` : 'Enter quantity'}
                value={form.stock} onChange={e => set('stock', e.target.value)} />
              {prefill?.stock && (
                <p className="text-[11px] mt-1 text-slate-400 font-medium">You have {prefill.stock} {prefill.unit} available</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Min Order Qty</label>
              <input type="number" min="1" className={inputClass} value={form.minimumOrderQty}
                onChange={e => set('minimumOrderQty', e.target.value)} />
              <p className="text-[10px] mt-1 text-slate-400 font-medium">Minimum units a buyer must order</p>
            </div>

            <div>
              <label className={labelClass}>Max Order Qty</label>
              <input type="number" min="1" className={inputClass} placeholder="Unlimited"
                value={form.maximumOrderQty} onChange={e => set('maximumOrderQty', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Search Tags (comma separated)</label>
              <input className={inputClass} placeholder="fresh, local, cashew, organic..."
                value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>

            <div className="flex items-end mb-1">
              <button type="button"
                onClick={() => set('isOrganic', !form.isOrganic)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all w-full justify-center
                  ${form.isOrganic ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full border-2 transition-all ${form.isOrganic ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`} />
                Mark as Organic
              </button>
            </div>
          </div>
        </div>

        {/* Advanced backend fields */}
        <div className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-100/50 p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Advanced Product Fields</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sub Category</label>
              <input className={inputClass} placeholder="e.g. Premium Kaju"
                value={form.subCategory} onChange={e => set('subCategory', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Compare At Price (₹)</label>
              <input type="number" min="0" step="0.5" className={inputClass}
                placeholder="Original price for discount display"
                value={form.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Original Purchase Price (₹)</label>
              <input type="number" min="0" step="0.5" className={inputClass}
                value={form.originalPurchasePrice} onChange={e => set('originalPurchasePrice', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Original Product ID</label>
              <input className={inputClass} placeholder="Only for resale products"
                value={form.originalProductId} onChange={e => set('originalProductId', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Source Seller ID</label>
              <input className={inputClass} placeholder="Seller who supplied this item"
                value={form.sourceSellerId} onChange={e => set('sourceSellerId', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Bulk Pricing JSON</label>
              <textarea rows={4} className={inputClass} placeholder='[{"minQuantity":10,"pricePerUnit":90,"discount":5}]'
                value={form.bulkPricing} onChange={e => set('bulkPricing', e.target.value)} />
              <p className="text-[10px] mt-1 text-slate-400 font-medium">Optional. Enter valid JSON array for bulk pricing tiers.</p>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button type="button"
                onClick={() => set('isAvailable', !form.isAvailable)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all w-full justify-center
                  ${form.isAvailable ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full border-2 transition-all ${form.isAvailable ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`} />
                Available for sale
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-100/50 p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Delivery Options</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <div
                onClick={() => set('deliveryAvailable', !form.deliveryAvailable)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${form.deliveryAvailable ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <p className="text-sm font-bold text-slate-800">Home Delivery Available</p>
                  <p className="text-xs text-slate-500 mt-0.5">Buyers can order for delivery to their address</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0
                  ${form.deliveryAvailable ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300
                    ${form.deliveryAvailable ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>

            {form.deliveryAvailable && (
              <>
                <div>
                  <label className={labelClass}>Delivery Charges (₹)</label>
                  <input type="number" min="0" className={inputClass}
                    value={form.deliveryCharges} onChange={e => set('deliveryCharges', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Free Delivery Above (₹)</label>
                  <input type="number" min="0" className={inputClass} placeholder="E.g. 500"
                    value={form.freeDeliveryAbove} onChange={e => set('freeDeliveryAbove', e.target.value)} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary strip when category is selected */}
        {form.category && (
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-violet-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-bold text-violet-700">
              {form.name || 'Product'} · {selectedCategoryLabel} · ₹{form.pricePerUnit || '—'}/{form.unit} · Stock: {form.stock || '—'}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm py-3 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm py-3 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
            {loading ? 'Publishing...' : 'Publish Listing →'}
          </button>
        </div>
      </form>
    </div>
  )
}
