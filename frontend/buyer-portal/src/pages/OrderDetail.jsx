import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Loader from '../components/common/Loader'
import api from '../services/api'
import { statusSteps } from '../utils/constants'
import { formatCurrency, getStatusClasses } from '../utils/helpers'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadOrder = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/orders/${id}`)
      setOrder(response.order)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await api.put(`/api/orders/${id}/cancel`, { reason: 'Cancelled by buyer' })
      toast.success('Order cancelled')
      await loadOrder()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRate = async (event) => {
    event.preventDefault()
    setActionLoading(true)

    try {
      await api.post(`/api/orders/${id}/rate`, { rating, review })
      toast.success('Thank you for your review')
      await loadOrder()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <Loader className="h-64" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error || 'Order not found'}
      </div>
    )
  }

  const currentStepIndex = Math.max(0, statusSteps.indexOf(order.status))
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        {/* Header section */}
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Order details</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-500">Placed on {new Date(order.orderDate).toLocaleString('en-IN')}</p>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${getStatusClasses(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Horizontal Status Bar */}
        <div className="mt-10 mb-8 relative">
          <div className="absolute top-2 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10" />
          <div className="absolute top-2 left-[10%] h-0.5 bg-emerald-500 -z-10 transition-all duration-500" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 80}%` }} />
          <div className="flex justify-between">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`h-4 w-4 rounded-full border-2 border-white transition-colors duration-500 ${index <= currentStepIndex ? 'bg-emerald-500 shadow-[0_0_0_2px_theme(colors.emerald.500)]' : 'bg-slate-200 shadow-[0_0_0_2px_theme(colors.slate.200)]'}`} />
                <span className={`mt-1 text-[11px] uppercase tracking-wider ${index <= currentStepIndex ? 'font-bold text-slate-900' : 'font-semibold text-slate-400'}`}>
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="mt-8 rounded-[20px] bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Delivery address</p>
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900 text-base">{order.deliveryAddress?.recipientName}</p>
            <p className="mt-0.5 text-slate-600">{order.deliveryAddress?.phone}</p>
            <div className="mt-3 leading-relaxed">
              <p>{order.deliveryAddress?.flatOrShopNumber}, {order.deliveryAddress?.buildingName}</p>
              <p>{order.deliveryAddress?.streetName}, {order.deliveryAddress?.area}</p>
              {order.deliveryAddress?.landmark && <p>Landmark: {order.deliveryAddress.landmark}</p>}
              <p className="font-medium mt-1">{order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Items Ordered</p>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.productId || item.productName} className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 p-4 transition hover:border-indigo-200">
                <div>
                  <p className="font-semibold text-slate-900 text-base">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.quantity} {item.unit} × {formatCurrency(item.pricePerUnit)}</p>
                </div>
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-[20px] border border-slate-200 bg-slate-50/50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Order summary</p>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 text-base">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.deliveryCharges > 0 && (
              <div className="flex justify-between items-center">
                <span>Delivery</span>
                <span className="font-semibold text-slate-900 text-base">{formatCurrency(order.deliveryCharges)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          {order.status === 'pending' ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Awaiting Retailer Confirmation to Generate Bill
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/orders/${order._id}/invoice`)}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
            >
              📄 View Generated Bill / Invoice
            </button>
          )}

          <div className="flex w-full gap-3 mt-2">
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Cancel order
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to orders
            </button>
          </div>
        </div>

        {order.status === 'delivered' && !order.buyerRated && (
          <form onSubmit={handleRate} className="mt-8 rounded-[24px] border border-indigo-100 bg-indigo-50/50 p-6">
            <p className="text-lg font-semibold text-slate-900">Rate this order</p>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Rating</span>
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="w-full rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-white px-4 py-3.5 font-medium shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} stars</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Review</span>
              <textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                rows="3"
                placeholder="Share your experience..."
                className="w-full rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-white px-4 py-3.5 shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </label>
            <button
              type="submit"
              disabled={actionLoading}
              className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
            >
              Submit review
            </button>
          </form>
        )}

        {order.buyerRated && (
          <div className="mt-8 rounded-[20px] bg-emerald-50 border border-emerald-100 p-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Review submitted</p>
              <p className="text-sm text-emerald-700">You rated this order {order.buyerRating?.score} stars</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
