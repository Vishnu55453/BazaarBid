import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'
import api from '../services/api'
import { formatCurrency, getStatusClasses } from '../utils/helpers'

const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

const MyOrders = () => {
  const [status, setStatus] = useState('all')
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/orders/my-orders', { status: status === 'all' ? undefined : status })
        setOrders(response.orders || [])
        setStats(response.stats || null)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [status])

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">My orders</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Track every order</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                status === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item === 'all' ? 'All' : item.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Total', stats.totalOrders],
            ['Pending', stats.pendingOrders],
            ['Confirmed', stats.confirmedOrders],
            ['Delivered', stats.deliveredOrders]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
          <Loader className="h-48" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No orders for this filter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{order.orderNumber}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{order.sellerId?.shopName || order.sellerId?.name || 'Seller'}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.items?.length || 0} item(s) • {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Delivered by {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/orders/${order._id}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
