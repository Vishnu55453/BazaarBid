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
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <Loader className="h-64" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error || 'Order not found'}
      </div>
    )
  }

  const currentStepIndex = Math.max(0, statusSteps.indexOf(order.status))
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Order details</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-500">Placed on {new Date(order.orderDate).toLocaleString('en-IN')}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {statusSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${index <= currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <span className={`text-sm ${index <= currentStepIndex ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                {step.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[20px] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Delivery address</p>
          <p className="mt-2 text-sm text-slate-600">{order.deliveryAddress?.addressLine1}</p>
          <p className="text-sm text-slate-600">{order.deliveryAddress?.area}, {order.deliveryAddress?.city}</p>
          <p className="text-sm text-slate-600">PIN {order.deliveryAddress?.pincode}</p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-900">Items</p>
          <div className="mt-3 space-y-3">
            {order.items?.map((item) => (
              <div key={item.productId || item.productName} className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.productName}</p>
                  <p className="text-sm text-slate-500">{item.quantity} {item.unit}</p>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Order summary</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-slate-900">{formatCurrency(order.deliveryCharges)}</span></div>
          <div className="flex justify-between"><span>Platform fee</span><span className="font-semibold text-slate-900">{formatCurrency(order.platformCommission)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {order.status === 'pending' ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
              <svg className="h-4 w-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Awaiting Retailer Confirmation to Generate Bill
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/orders/${order._id}/invoice`)}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              📄 View Generated Bill / Invoice
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={actionLoading}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
            >
              Cancel order
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to orders
          </button>
        </div>

        {order.status === 'delivered' && !order.buyerRated && (
          <form onSubmit={handleRate} className="mt-6 rounded-[20px] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Rate this order</p>
            <label className="mt-3 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rating</span>
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} stars</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Review</span>
              <textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                rows="3"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={actionLoading}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Submit review
            </button>
          </form>
        )}

        {order.buyerRated && (
          <div className="mt-6 rounded-[20px] bg-emerald-50 p-4 text-sm text-emerald-800">
            Review submitted: {order.buyerRating?.score} stars
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
