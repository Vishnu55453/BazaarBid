import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function MyProducts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchProducts = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const res = await api.get(`/api/products/seller/${user.id}`)
      if (res.success) setProducts(res.products || [])
    } catch {
      toast.error('Could not load product listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [user?.id])

  const handleStockUpdate = async (id, newStock) => {
    if (newStock < 0) return
    setUpdatingId(id)
    try {
      await api.put(`/api/products/${id}/stock`, { stock: Number(newStock) })
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: Number(newStock) } : p))
      toast.success('Stock updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update stock')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your listings?`)) return
    setDeletingId(id)
    try {
      await api.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Listing removed')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQ.toLowerCase())
  )

  const totalRevenue = products.reduce((s, p) => s + ((p.pricePerUnit || 0) * (p.totalSold || 0)), 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-1">Retail Seller Desk</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Listings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your retail product catalog for neighborhood buyers.</p>
        </div>
        <button
          onClick={() => navigate('/seller/add-product')}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs px-4 py-3 shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Listed Products', value: products.length },
          { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length },
          { label: 'Revenue Generated', value: `₹${totalRevenue.toFixed(0)}` }
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-[20px] px-4 py-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-xl font-black text-slate-900 mt-1 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input placeholder="Search listings..."
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
      </div>

      {/* Products */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[20px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[28px] p-12 text-center shadow-xl shadow-slate-100/50">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-sm">{searchQ ? 'No listings found' : 'No products listed yet'}</p>
          <p className="text-slate-400 text-xs mt-1 mb-4">
            {searchQ ? 'Try different keywords.' : 'Add your first retail product to start selling locally.'}
          </p>
          {!searchQ && (
            <button onClick={() => navigate('/seller/add-product')}
              className="rounded-xl bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 hover:bg-indigo-700 transition">
              List First Product
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => {
            const outOfStock = product.stock === 0
            return (
              <div key={product._id}
                className={`bg-white border rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all ${outOfStock ? 'border-rose-100' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-slate-900">{product.name}</p>
                      {product.isOrganic && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Organic</span>
                      )}
                      {outOfStock && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase">Out of Stock</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{product.category} • ₹{product.pricePerUnit}/{product.unit}</p>
                    {product.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{product.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-center hidden md:block">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Sold</p>
                      <p className="text-base font-black text-slate-900">{product.totalSold || 0}</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Rating</p>
                      <p className="text-base font-black text-amber-500">{product.rating?.toFixed(1) || '—'}</p>
                    </div>

                    {/* Inline stock editor */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                      <button
                        onClick={() => handleStockUpdate(product._id, (product.stock || 0) - 1)}
                        disabled={updatingId === product._id || (product.stock || 0) <= 0}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-30 font-black text-sm">
                        −
                      </button>
                      <span className={`text-sm font-black w-8 text-center ${outOfStock ? 'text-rose-600' : 'text-slate-900'}`}>
                        {product.stock ?? 0}
                      </span>
                      <button
                        onClick={() => handleStockUpdate(product._id, (product.stock || 0) + 1)}
                        disabled={updatingId === product._id}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition disabled:opacity-30 font-black text-sm">
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      disabled={deletingId === product._id}
                      className="rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 p-2 transition disabled:opacity-40">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
