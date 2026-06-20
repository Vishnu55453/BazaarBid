import { useEffect, useState } from 'react'
import api from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { toast } from 'react-hot-toast'

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_NEXT = {
  pending: { label: 'Confirm Order', next: 'confirmed', color: 'indigo' },
  confirmed: { label: 'Start Processing', next: 'processing', color: 'violet' },
  processing: { label: 'Mark Shipped', next: 'shipped', color: 'amber' },
  shipped: { label: 'Mark Delivered', next: 'delivered', color: 'emerald' }
}

function OrderCard({ order, onStatusUpdate, onCancelOrder }) {
  const [updating, setUpdating] = useState(false)
  const nextStatus = STATUS_NEXT[order.status]

  const handleNext = async () => {
    if (!nextStatus) return

    if (order.status === 'pending') {
      const msg = "Confirm this order?\n\nThis will officially accept the order, generate the Tax Invoice (Bill), and notify the Buyer."
      if (!window.confirm(msg)) return
    } else {
      if (!window.confirm(`Move order to "${nextStatus.next}"?`)) return
    }
    setUpdating(true)
    try {
      await onStatusUpdate(order._id, nextStatus.next)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    const reason = window.prompt("Reason for rejecting/cancelling this order:")
    if (!reason) return
    
    setUpdating(true)
    try {
      await onCancelOrder(order._id, reason)
    } finally {
      setUpdating(false)
    }
  }

  const progressIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <div className={`bg-white border rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all
      ${order.status === 'pending' ? 'border-amber-200' :
        order.status === 'cancelled' ? 'border-rose-100 opacity-70' :
        order.status === 'delivered' ? 'border-emerald-100' : 'border-slate-200'}`}>

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-black text-slate-900">
              {order.buyerId?.name || 'Local Customer'}
            </p>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              #{order._id?.slice(-6).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500">
            {order.buyerId?.phone && `📞 ${order.buyerId.phone} · `}
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-black text-slate-900">₹{order.totalAmount}</p>
          <p className={`text-[10px] font-extrabold uppercase mt-0.5 ${order.paymentDetails?.method === 'COD' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {order.paymentDetails?.method === 'COD' ? '💵 COD Pending' : '✅ Paid Online'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {order.status !== 'cancelled' && (
        <div className="flex items-center gap-1 mb-4">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= progressIdx ? 'bg-indigo-500' : 'bg-slate-100'}`} />
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="bg-slate-50 rounded-2xl p-3 space-y-2 mb-4">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold truncate flex-1 mr-2">
              {item.productId?.name || item.productName || 'Product'}
            </span>
            <span className="text-slate-500 flex-shrink-0">
              {item.quantity} {item.unit} × ₹{item.pricePerUnit}
            </span>
            <span className="font-bold text-slate-900 ml-3 flex-shrink-0">₹{item.subtotal || item.quantity * item.pricePerUnit}</span>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="flex items-start gap-2 text-xs text-slate-500 mb-4">
          <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {order.deliveryAddress.street && `${order.deliveryAddress.street}, `}
            {order.deliveryAddress.city}{order.deliveryAddress.pincode && ` - ${order.deliveryAddress.pincode}`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {order.status === 'pending' && (
          <button onClick={handleCancel} disabled={updating}
            className="flex-1 rounded-2xl font-bold text-xs py-2.5 transition disabled:opacity-40 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200">
            Reject Order
          </button>
        )}

        {nextStatus && order.status !== 'cancelled' && (
          <button onClick={handleNext} disabled={updating}
            className={`flex-[2] rounded-2xl font-bold text-xs py-2.5 transition disabled:opacity-40
              ${nextStatus.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100' :
                nextStatus.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-100' :
                nextStatus.color === 'amber' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100' :
                'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100'}`}>
            {updating ? 'Updating...' : `→ ${nextStatus.label}`}
          </button>
        )}

        {/* View Bill button appears immediately after confirmation */}
        {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
          <a
            href={`/orders/${order._id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 py-2.5 px-4 border border-indigo-200 rounded-2xl hover:bg-indigo-50 transition bg-white"
          >
            View Bill
          </a>
        )}
      </div>

      {order.status === 'delivered' && (
        <div className="mt-3 text-center text-xs text-emerald-600 font-bold py-2 bg-emerald-50 rounded-2xl">
          ✅ Order Delivered Successfully
        </div>
      )}
    </div>
  )
}

export default function OrdersReceived() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/orders/seller-orders')
      const data = res.orders || res || []
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update order status')
    }
  }

  const handleCancelOrder = async (id, reason) => {
    try {
      await api.put(`/api/orders/${id}/cancel`, { reason })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o))
      toast.success('Order cancelled successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-1">Retail Seller Desk</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Orders Received</h1>
        <p className="text-slate-500 text-sm mt-1">Confirm → Process → Ship → Deliver your retail orders.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Confirmation', value: stats.pending, accent: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: stats.active, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Delivered', value: stats.delivered, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue', value: `₹${stats.revenue}`, accent: 'text-slate-900', bg: 'bg-slate-50' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-200 rounded-[20px] px-4 py-4`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => {
          const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all
                ${filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {f} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[24px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[28px] p-12 text-center shadow-xl shadow-slate-100/50">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-sm">No {filter !== 'all' ? filter : ''} orders yet</p>
          <p className="text-slate-400 text-xs mt-1">Orders placed by neighborhood buyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onCancelOrder={handleCancelOrder} />
          ))}
        </div>
      )}
    </div>
  )
}
