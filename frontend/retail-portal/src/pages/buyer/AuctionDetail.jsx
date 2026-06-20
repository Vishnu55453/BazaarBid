import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { toast } from 'react-hot-toast'
import ReviewsModal from '../../components/ReviewsModal'

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-semibold flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
    </div>
  )
}

export default function AuctionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [awardingBidId, setAwardingBidId] = useState(null)

  // Reviews Modal state
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState({ id: null, name: '' })

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/auctions/${id}`)
      if (res.success || res.auction) {
        setAuction(res.auction || res)
        setBids(res.bids || [])
      }
    } catch (err) {
      toast.error('Could not load auction details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) fetchDetail() }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this auction? This action cannot be undone.')) return
    setCancelling(true)
    try {
      const res = await api.put(`/api/auctions/${id}/cancel`)
      if (res.success || res.auction) {
        toast.success('Auction cancelled')
        navigate('/buyer/auctions')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  const handleAwardBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to award the auction to this bid? This will close the auction.')) return
    setAwardingBidId(bidId)
    try {
      const res = await api.put(`/api/auctions/${id}/award/${bidId}`)
      if (res.success) {
        toast.success('Bid accepted! Awaiting Seller Confirmation to generate bill.')
        fetchDetail()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to award bid')
    } finally {
      setAwardingBidId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-[28px] animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-[28px] animate-pulse" />
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="bg-white border border-slate-200 rounded-[28px] p-12 text-center shadow-xl">
        <p className="text-slate-700 font-bold">Auction not found.</p>
        <button onClick={() => navigate('/buyer/auctions')}
          className="mt-4 rounded-xl bg-indigo-600 text-white text-xs font-bold px-5 py-2.5">
          ← Back to Auctions
        </button>
      </div>
    )
  }

  const now = new Date()
  const endDate = new Date(auction.endTime)
  const diff = endDate - now
  const hrs = Math.max(0, Math.floor(diff / 3600000))
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000))

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/buyer/auctions')}
          className="rounded-xl bg-slate-100 hover:bg-slate-200 p-2 transition">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500">Auction Detail</p>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{auction.productName}</h1>
        </div>
      </div>

      <div className="space-y-4">
        {/* Auction Info */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-md shadow-slate-100/50">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={auction.status} />
              {auction.status === 'open' && (
                <span className={`text-xs font-bold ${hrs < 2 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'} px-2.5 py-1 rounded-full`}>
                  ⏱ {hrs}h {mins}m remaining
                </span>
              )}
            </div>
            {auction.status === 'open' && (
              <button onClick={handleCancel} disabled={cancelling}
                className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs px-5 py-2.5 transition disabled:opacity-40 shadow-sm">
                {cancelling ? 'Cancelling...' : 'Cancel Auction'}
              </button>
            )}
          </div>
          
          {auction.items && auction.items.length > 0 ? (
            <div className="space-y-6">
              {auction.items.map((item, index) => (
                <div key={item._id || index} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-2">Item {index + 1}: {item.productName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
                    <InfoRow label="Category" value={item.category} />
                    <InfoRow label="Quantity Required" value={`${item.quantity} ${item.unit}`} />
                    <InfoRow label="Grade" value={item.qualitySpecs?.grade} />
                    <InfoRow label="Organic" value={item.qualitySpecs?.organic ? 'Yes' : 'No'} />
                    <InfoRow label="Freshness" value={item.qualitySpecs?.freshness} />
                    <InfoRow label="Packaging" value={item.qualitySpecs?.packaging} />
                    {item.budgetRange?.min && <InfoRow label="Budget Range" value={`₹${item.budgetRange.min} – ₹${item.budgetRange.max} / unit`} />}
                    <InfoRow label="Item Status" value={item.status.toUpperCase()} />
                  </div>
                  {item.qualitySpecs?.customRequirements && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Custom Requirements</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.qualitySpecs.customRequirements}</p>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1 pt-4 border-t border-slate-100">
                <InfoRow label="Bidding Mode" value={auction.allowPartialBids ? 'Partial Bids Allowed' : 'All Items Mandatory'} />
                <InfoRow label="Preferred Market" value={auction.preferredMarket?.replace(/_/g, ' ')} />
                <InfoRow label="Delivery Timeline" value={`${auction.deliveryTimeline} day(s)`} />
                {auction.minRatingRequired > 0 && <InfoRow label="Min Seller Rating" value={`${auction.minRatingRequired}+ Stars`} />}
                <div className="md:col-span-2 lg:col-span-3">
                  <InfoRow label="Delivery To" value={`${auction.deliveryAddress?.area}, ${auction.deliveryAddress?.city} - ${auction.deliveryAddress?.pincode}`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
              <InfoRow label="Category" value={auction.category} />
              <InfoRow label="Quantity Required" value={`${auction.quantity} ${auction.unit}`} />
              <InfoRow label="Grade" value={auction.qualitySpecs?.grade} />
              <InfoRow label="Organic" value={auction.qualitySpecs?.organic ? 'Yes' : 'No'} />
              <InfoRow label="Freshness" value={auction.qualitySpecs?.freshness} />
              <InfoRow label="Packaging" value={auction.qualitySpecs?.packaging} />
              <InfoRow label="Preferred Market" value={auction.preferredMarket?.replace(/_/g, ' ')} />
              <InfoRow label="Delivery Timeline" value={`${auction.deliveryTimeline} day(s)`} />
              {auction.minRatingRequired > 0 && <InfoRow label="Min Seller Rating" value={`${auction.minRatingRequired}+ Stars`} />}
              {auction.budgetRange?.min && <InfoRow label="Budget Range" value={`₹${auction.budgetRange.min} – ₹${auction.budgetRange.max} / unit`} />}
              <div className="md:col-span-2 lg:col-span-3">
                <InfoRow label="Delivery To" value={`${auction.deliveryAddress?.area}, ${auction.deliveryAddress?.city} - ${auction.deliveryAddress?.pincode}`} />
              </div>
            </div>
          )}

          {!auction.items && auction.qualitySpecs?.customRequirements && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Custom Requirements</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{auction.qualitySpecs.customRequirements}</p>
            </div>
          )}
        </div>

        {/* Winner details (if awarded) */}
        {auction.status === 'awarded' && auction.winningPrice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">🏆 Auction Awarded</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-emerald-800">₹{auction.winningPrice}</p>
                <p className="text-sm text-emerald-600 mt-1 font-bold">₹{auction.winningPricePerUnit?.toFixed(2)}/unit</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Awarded on {new Date(auction.awardedAt).toLocaleDateString('en-IN')}</p>
              </div>
              
              {auction.orderId && (
                <div className="w-full max-w-sm pl-6 border-l border-emerald-200/50">
                  {auction.orderId.status === 'pending' ? (
                    <div className="text-center bg-white/60 text-emerald-700 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-emerald-100 shadow-sm">
                      <svg className="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Awaiting Seller Confirmation to Generate Bill
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/orders/${auction.orderId._id || auction.orderId}/invoice`)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-emerald-100"
                    >
                      📄 View Generated Bill / Invoice
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Width Bottom Section: Bids Table */}
      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-md shadow-slate-100/50 mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-slate-900">Supplier Bids</h3>
            {bids.length > 0 && (
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full shadow-sm">
                {auction.totalBids ?? bids.length} bid{bids.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Bid Summary */}
          {bids.length > 0 && (
            <div className="flex gap-8 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lowest Bid</p>
                <p className="text-base font-black text-emerald-600 leading-tight">
                  {bids.length > 0 ? `₹${Math.min(...bids.map(b => b.totalBidValue))}` : '—'}
                </p>
              </div>
              <div className="w-px bg-slate-100"></div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Highest Bid</p>
                <p className="text-base font-black text-rose-500 leading-tight">
                  {bids.length > 0 ? `₹${Math.max(...bids.map(b => b.totalBidValue))}` : '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Total Bid</th>
                <th className="px-6 py-4">Items Included</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Perks & Notes</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <p className="text-slate-700 font-bold text-sm">No bids yet</p>
                    <p className="text-slate-400 text-xs mt-1">Suppliers will bid as your auction reaches them.</p>
                  </td>
                </tr>
              ) : (
                bids.map((bid, idx) => (
                  <tr key={bid._id} 
                    className={`transition-all hover:bg-slate-50/80
                      ${bid.status === 'won' ? 'bg-emerald-50/50' :
                        bid.rank === 1 ? 'bg-indigo-50/20' : 'bg-white'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black
                          ${bid.rank === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          #{bid.rank || idx + 1}
                        </div>
                        {bid.rank === 1 && bid.status !== 'won' && (
                          <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider">Lowest</span>
                        )}
                        {bid.status === 'won' && (
                          <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">Winner</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{bid.sellerId?.bigMarketProfile?.shopName || bid.sellerId?.name || 'Supplier'}</span>
                        <button 
                          onClick={() => {
                            setSelectedSeller({
                              id: bid.sellerId?._id,
                              name: bid.sellerId?.bigMarketProfile?.shopName || bid.sellerId?.name
                            })
                            setReviewsModalOpen(true)
                          }}
                          className="text-xs font-medium text-slate-500 mt-0.5 flex items-center hover:text-indigo-600 transition text-left"
                        >
                          <span className="text-yellow-400 mr-1">★</span> 
                          {bid.sellerId?.rating?.average || 0} ({bid.sellerId?.rating?.count || 0} reviews)
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-lg font-black tracking-tight ${bid.discountOffered > 0 && auction.items?.length > 1 ? 'text-slate-400 line-through text-sm' : 'text-slate-900'}`}>₹{bid.totalBidValue}</p>
                      {bid.discountOffered > 0 && auction.items?.length > 1 && bid.bidItems?.length === auction.items?.length && (
                        <div className="mt-1 flex flex-col items-start gap-1">
                          <p className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded leading-tight">
                            -{bid.discountOffered}% if all awarded
                          </p>
                          <p className="text-base font-black text-emerald-600">
                            ₹{(bid.totalBidValue * (1 - bid.discountOffered / 100)).toFixed(0)} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">total</span>
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {bid.bidItems?.map(bItem => {
                          const aItem = auction.items?.find(i => i._id === bItem.itemId)
                          return (
                            <div key={bItem.itemId} className="text-xs bg-slate-50 border border-slate-100 p-1.5 rounded-md flex justify-between items-center gap-3">
                              <span className="font-bold text-slate-700 truncate max-w-[120px]">{aItem?.productName || 'Item'}</span>
                              <span className="text-slate-600">₹{bItem.pricePerUnit}/unit</span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        🚚 {bid.deliveryTimeline} day{bid.deliveryTimeline > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 min-w-[120px]">
                        {bid.freeDelivery && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Free Delivery</span>}
                        {bid.qualityGuarantee && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Quality Guarantee</span>}
                        {bid.discountOffered > 0 && <span className="text-[9px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md">{bid.discountOffered}% Off</span>}
                        {bid.additionalNotes && <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md italic truncate max-w-[150px]" title={bid.additionalNotes}>"{bid.additionalNotes}"</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {auction.status === 'open' && bid.status === 'active' ? (
                        <button 
                          onClick={() => handleAwardBid(bid._id)}
                          disabled={awardingBidId === bid._id}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-50 whitespace-nowrap"
                        >
                          {awardingBidId === bid._id ? 'Accepting...' : 'Accept Bid'}
                        </button>
                      ) : bid.status === 'won' ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">Accepted</span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewsModal 
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        userId={selectedSeller.id}
        userName={selectedSeller.name}
      />
    </div>
  )
}
