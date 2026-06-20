import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../components/common/StatusBadge'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeAuctionsCount: 0,
    inventoryCount: 0,
    pendingOrdersCount: 0
  })
  const [activeAuctions, setActiveAuctions] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [inventoryList, setInventoryList] = useState([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch auctions created by current Kirana user
      let myAuctions = []
      try {
        const auctionRes = await api.get('/api/auctions/my/auctions')
        if (auctionRes.success) {
          myAuctions = auctionRes.auctions
          setActiveAuctions(myAuctions.filter(a => a.status === 'open' || a.status === 'awarded').slice(0, 5))
        }
      } catch (err) {
        console.error('Error fetching auctions:', err)
      }

      // 2. Fetch orders received as a seller
      let incomingOrders = []
      try {
        const ordersRes = await api.get('/api/orders/seller-orders')
        incomingOrders = ordersRes.orders || ordersRes || []
        setRecentOrders(incomingOrders.slice(0, 5))
      } catch (err) {
        console.error('Error fetching seller orders:', err)
      }

      // 3. Fetch products listed for retail
      let listedProducts = []
      try {
        if (user?.id) {
          const productsRes = await api.get(`/api/products/seller/${user.id}`)
          if (productsRes.success) {
            listedProducts = productsRes.products
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      }

      // 4. Fetch updated profile/me to get fresh inventory array
      let updatedUser = user
      try {
        const meRes = await api.get('/api/auth/me')
        if (meRes.success) {
          updatedUser = meRes.user
          setInventoryList(updatedUser.kiranaProfile?.inventory || [])
        }
      } catch (err) {
        console.error('Error fetching me profile:', err)
      }

      // Calculate KPI metrics
      const earnings = updatedUser?.totalSales || listedProducts.reduce((sum, p) => sum + (p.pricePerUnit * p.totalSold || 0), 0)
      const openAuctions = myAuctions.filter(a => a.status === 'open').length
      const distinctStock = updatedUser?.kiranaProfile?.inventory?.length || 0
      const pendingOrders = incomingOrders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length

      setStats({
        totalEarnings: earnings,
        activeAuctionsCount: openAuctions,
        inventoryCount: distinctStock,
        pendingOrdersCount: pendingOrders
      })

    } catch (err) {
      toast.error('Failed to load dashboard statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const handleCancelAuction = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this bulk auction?')) return
    try {
      const res = await api.put(`/api/auctions/${id}/cancel`)
      if (res.success || res.auction) {
        toast.success('Bulk auction cancelled successfully')
        fetchDashboardData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel auction')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 rounded-[24px] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-[32px] animate-pulse" />
          <div className="h-96 bg-slate-200 rounded-[32px] animate-pulse" />
        </div>
      </div>
    )
  }

  const shopName = user?.kiranaProfile?.asSeller?.shopName || 'Local Kirana Shop'

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Namaste, {shopName}! 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage your bulk wholesale orders and neighborhood retail delivery.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/buyer/create-auction')}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 shadow-md shadow-indigo-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Bulk Auction
          </button>
          
          <button
            onClick={() => navigate('/seller/inventory')}
            className="flex items-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-3 shadow-md shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            List Products for Sale
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Earnings (Seller) */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[28px] p-6 shadow-md shadow-slate-100/40 hover:shadow-lg transition-all duration-300">
          <div className="absolute right-4 top-4 bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Retail Earnings</p>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{stats.totalEarnings}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
            <span>↑ 12.5%</span>
            <span className="text-slate-400 font-medium">this week</span>
          </div>
        </div>

        {/* Active Bulk Auctions (Buyer) */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[28px] p-6 shadow-md shadow-slate-100/40 hover:shadow-lg transition-all duration-300">
          <div className="absolute right-4 top-4 bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Bulk Auctions</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.activeAuctionsCount}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-2">
            <span className="text-indigo-600">Buying</span>
            <span className="text-slate-400 font-medium">direct from wholesalers</span>
          </div>
        </div>

        {/* Distinct Products stocked (Seller) */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[28px] p-6 shadow-md shadow-slate-100/40 hover:shadow-lg transition-all duration-300">
          <div className="absolute right-4 top-4 bg-violet-50 text-violet-600 p-3 rounded-2xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16.01H9" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Stocked items</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.inventoryCount}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-2">
            <span className="text-violet-600">Ready to sell</span>
            <span className="text-slate-400 font-medium">in retail shop</span>
          </div>
        </div>

        {/* Pending Deliveries (Seller) */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[28px] p-6 shadow-md shadow-slate-100/40 hover:shadow-lg transition-all duration-300">
          <div className="absolute right-4 top-4 bg-amber-50 text-amber-600 p-3 rounded-2xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Local Orders</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.pendingOrdersCount}</p>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mt-2">
            <span>Needs confirmation</span>
            <span className="text-slate-400 font-medium">or packaging</span>
          </div>
        </div>

      </div>

      {/* Main Dual Role Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: As Buyer - Bulk Purchasing Auctions */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[32px] p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Bulk Purchasing Desk
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">Your Active Bulk Auctions</h3>
              </div>
              <button
                onClick={() => navigate('/buyer/auctions')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                View All →
              </button>
            </div>

            {activeAuctions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                  </svg>
                </div>
                <p className="text-slate-800 font-bold text-sm">No Active Bulk Orders</p>
                <p className="text-slate-400 text-xs max-w-xs leading-normal">
                  Create a bulk auction to request supply bids directly from wholesale suppliers in big markets.
                </p>
                <button
                  onClick={() => navigate('/buyer/create-auction')}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold px-4 py-2 mt-2 transition"
                >
                  Create Your First Auction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Requirement</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Bids</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Lowest Bid</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAuctions.map((auction) => (
                      <tr key={auction._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 pr-2">
                          <p className="text-sm font-bold text-slate-800">{auction.productName}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {auction.quantity} {auction.unit} • {auction.preferredMarket?.replace('_', ' ')}
                          </p>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 px-1">
                            {auction.bidCount ?? 0}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <p className="text-sm font-black text-slate-900">
                            {auction.lowestBid ? `₹${auction.lowestBid}` : '—'}
                          </p>
                          {auction.budgetRange?.max && (
                            <p className="text-[10px] text-slate-400 font-medium">Budget: ₹{auction.budgetRange.max}</p>
                          )}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={auction.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/buyer/auctions/${auction._id}`)}
                              className="rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-extrabold px-3 py-1.5 transition"
                            >
                              Details
                            </button>
                            {auction.status === 'open' && (
                              <button
                                onClick={() => handleCancelAuction(auction._id)}
                                className="rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-extrabold px-2 py-1.5 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 mt-6">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">💡 Wholesale Markets Integrated</h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-1">
              Your auctions are automatically broadcasted to verified seller terminals across Vashi Vegetable Market, Byculla Fruit Market, and Vashi Dry Fruits Market.
            </p>
          </div>
        </div>

        {/* Right Column: As Seller - Local Retail Deliveries */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[32px] p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Retail Seller Desk
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">Recent Retail Orders</h3>
              </div>
              <button
                onClick={() => navigate('/seller/orders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-950 transition"
              >
                View All →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-slate-800 font-bold text-sm">No Local Orders Yet</p>
                <p className="text-slate-400 text-xs max-w-xs leading-normal">
                  As neighborhood shoppers discover your listings on the buyer portal, orders will stream here.
                </p>
                <button
                  onClick={() => navigate('/seller/inventory')}
                  className="rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold px-4 py-2 mt-2 transition"
                >
                  List Item from Stock
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50/50 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {order.buyerId?.name || 'Local Customer'}
                        <span className="text-[10px] font-semibold text-slate-400">#{order._id?.slice(-5)}</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {order.items?.length || 0} items • ₹{order.totalAmount}
                      </p>
                      <div className="flex gap-2 items-center pt-1">
                        <StatusBadge status={order.status} />
                        {order.paymentDetails?.method === 'COD' && (
                          <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            COD Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/seller/orders`)}
                      className="rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-extrabold px-3.5 py-2 transition shadow-sm"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">📦 Stock Inventory Snapshot</h4>
            {inventoryList.length === 0 ? (
              <p className="text-xs text-slate-400 leading-normal">
                No wholesale items logged in your store. Complete an auction to stock up directly from farmers and wholesale suppliers.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {inventoryList.slice(0, 4).map((item) => (
                  <div key={item._id || item.productId} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.originalProductName}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Stock: <span className="text-slate-800">{item.stock} {item.unit}</span>
                    </p>
                    <p className="text-[9px] text-indigo-600 font-bold">Bot @ ₹{item.purchasePrice}/{item.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
