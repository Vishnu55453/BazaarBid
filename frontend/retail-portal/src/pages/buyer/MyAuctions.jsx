import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { toast } from 'react-hot-toast'

const STATUS_FILTERS = ['all', 'open', 'awarded', 'closed', 'expired', 'cancelled']

function TimeLeft({ endTime, status }) {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end - now
  if (status !== 'open' || diff <= 0) return <span className="text-slate-400 text-xs">—</span>
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const urgent = hrs < 2
  return (
    <span className={`text-xs font-bold ${urgent ? 'text-rose-600' : 'text-amber-600'}`}>
      {hrs}h {mins}m left
    </span>
  )
}

export default function MyAuctions() {
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  const fetchAuctions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/auctions/my/auctions')
      if (res.success) setAuctions(res.auctions)
    } catch (err) {
      toast.error('Could not load auctions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAuctions() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this bulk auction? This cannot be undone.')) return
    setCancellingId(id)
    try {
      const res = await api.put(`/api/auctions/${id}/cancel`)
      if (res.success || res.auction) {
        toast.success('Auction cancelled')
        fetchAuctions()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel auction')
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'all' ? auctions : auctions.filter(a => a.status === filter)

  const stats = {
    open: auctions.filter(a => a.status === 'open').length,
    awarded: auctions.filter(a => a.status === 'awarded').length,
    totalBids: auctions.reduce((sum, a) => sum + (a.totalBids || 0), 0)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Bulk Buyer Desk</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bulk Auctions</h1>
        </div>
        <button
          onClick={() => navigate('/buyer/create-auction')}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Auction
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Live Auctions', value: stats.open, color: 'indigo', icon: '🔴' },
          { label: 'Awarded', value: stats.awarded, color: 'emerald', icon: '✅' },
          { label: 'Total Bids Received', value: stats.totalBids, color: 'violet', icon: '📨' }
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-[20px] px-4 py-4 shadow-sm hover:shadow-md transition">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all
              ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            {f === 'all' ? `All (${auctions.length})` : f}
          </button>
        ))}
      </div>

      {/* Auctions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[28px] p-12 text-center shadow-xl shadow-slate-100/50">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-sm">No auctions found</p>
          <p className="text-slate-400 text-xs mt-1 mb-4">Create your first bulk purchase auction to get supply bids.</p>
          <button onClick={() => navigate('/buyer/create-auction')}
            className="rounded-xl bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 hover:bg-indigo-700 transition">
            Create Auction
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(auction => (
            <div key={auction._id}
              className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-pointer"
              onClick={() => navigate(`/buyer/auctions/${auction._id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-900">
                      {auction.items?.length > 1 ? `${auction.items.length} Items Auction` : (auction.items?.[0]?.productName || 'Auction')}
                    </p>
                    <StatusBadge status={auction.status} />
                    {auction.items?.some(i => i.qualitySpecs?.organic) && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Organic</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {auction.items?.length > 1 ? `Multiple Categories` : auction.items?.[0]?.category} • {auction.preferredMarket?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deliver to: {auction.deliveryAddress?.area}, {auction.deliveryAddress?.city}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bids</p>
                    <p className="text-lg font-black text-slate-900">{auction.totalBids ?? 0}</p>
                  </div>
                  {auction.lowestBid && (
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest</p>
                      <p className="text-lg font-black text-emerald-700">₹{auction.lowestBid}</p>
                    </div>
                  )}
                  {auction.budgetRange?.max && (
                    <div className="text-center hidden md:block">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                      <p className="text-sm font-black text-slate-600">₹{auction.budgetRange.max}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <TimeLeft endTime={auction.endTime} status={auction.status} />
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/buyer/auctions/${auction._id}`)}
                  className="rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold px-3 py-1.5 transition"
                >
                  View Bids →
                </button>
                {auction.status === 'open' && (
                  <button
                    onClick={() => handleCancel(auction._id)}
                    disabled={cancellingId === auction._id}
                    className="rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-3 py-1.5 transition disabled:opacity-40"
                  >
                    {cancellingId === auction._id ? 'Cancelling...' : 'Cancel Auction'}
                  </button>
                )}
                {auction.status === 'awarded' && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl">
                    🏆 Winner Selected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
