import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export default function Inventory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [listingId, setListingId] = useState(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/auth/me')
      if (res.success) {
        setInventory(res.user?.kiranaProfile?.inventory || [])
      }
    } catch {
      toast.error('Could not load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [])

  const filtered = inventory.filter(item =>
    item.originalProductName?.toLowerCase().includes(searchQ.toLowerCase())
  )

  const handleListForSale = (item) => {
    navigate('/seller/add-product', { state: { prefill: item } })
  }

  const totalValue = inventory.reduce((sum, item) => sum + ((item.purchasePrice || 0) * (item.stock || 0)), 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-1">Retail Seller Desk</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bought Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Stock received from wholesale auctions. List items for local retail sale.</p>
        </div>
        <button onClick={() => navigate('/buyer/create-auction')}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 shadow-md shadow-slate-200 transition-all hover:-translate-y-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buy More Stock
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total SKUs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{inventory.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{totalValue.toFixed(0)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Low Stock</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{inventory.filter(i => (i.stock || 0) < 5).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="Search inventory..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[20px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[28px] p-12 text-center shadow-xl shadow-slate-100/50">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-sm">{searchQ ? 'No items match your search' : 'No inventory yet'}</p>
          <p className="text-slate-400 text-xs mt-1 mb-4">
            {searchQ ? 'Try different keywords.' : 'Complete a bulk auction to populate your stock.'}
          </p>
          {!searchQ && (
            <button onClick={() => navigate('/buyer/create-auction')}
              className="rounded-xl bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 hover:bg-indigo-700 transition">
              Create Bulk Auction
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const lowStock = (item.stock || 0) < 5
            return (
              <div key={item._id || item.productId}
                className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  {lowStock && (
                    <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase">Low Stock</span>
                  )}
                </div>

                <p className="text-sm font-black text-slate-900 truncate">{item.originalProductName}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.category || 'General'}</p>

                <div className="mt-3 pt-3 border-t border-slate-50 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">In Stock</span>
                    <span className={`font-black ${lowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Cost Price</span>
                    <span className="font-bold text-slate-700">₹{item.purchasePrice}/{item.unit}</span>
                  </div>
                  {item.purchasePrice && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Stock Value</span>
                      <span className="font-bold text-indigo-700">₹{((item.purchasePrice || 0) * (item.stock || 0)).toFixed(0)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleListForSale(item)}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs py-2.5 transition shadow-sm shadow-indigo-200"
                >
                  List for Retail Sale →
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
