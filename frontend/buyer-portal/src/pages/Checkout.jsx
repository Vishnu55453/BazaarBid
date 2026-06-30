import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/helpers'

const defaultDelivery = {
  recipientName: '',
  phone: '',
  flatOrShopNumber: '',
  buildingName: '',
  streetName: '',
  area: '',
  city: '',
  pincode: '',
  landmark: ''
}

const Checkout = () => {
  const navigate = useNavigate()
  const { user, activePincode } = useAuth()
  const { cartItems, subtotal, deliveryCharges, total, clearCart } = useCart()
  const [deliveryAddress, setDeliveryAddress] = useState(defaultDelivery)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDeliveryAddress((current) => ({
      ...current,
      recipientName: user?.name || '',
      phone: user?.phone || '',
      city: user?.location?.city || '',
      area: user?.location?.area || '',
      pincode: user?.location?.pincode || ''
    }))
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (activePincode && deliveryAddress.pincode !== activePincode) {
      toast.error(`Delivery pincode must match your active location (${activePincode})`)
      return
    }

    setLoading(true)

    try {
      await api.post('/api/orders/direct', {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress,
        paymentMethod,
        notes
      })

      clearCart()
      toast.success('Order placed successfully')
      navigate('/orders')
    } catch (error) {
      toast.error(error.message || 'Unable to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add products to your cart before placing an order.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl rounded-[24px] border border-slate-200 bg-white p-6 md:p-10 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Checkout</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">Confirm delivery details</h1>

      {user?.savedAddresses?.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select saved address</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {user.savedAddresses.map((addr, idx) => (
              <div key={idx} onClick={() => {
                setDeliveryAddress({
                  recipientName: addr.recipientName || '',
                  phone: addr.phone || '',
                  flatOrShopNumber: addr.flatOrShopNumber || '',
                  buildingName: addr.buildingName || '',
                  streetName: addr.streetName || '',
                  area: addr.area || '',
                  city: addr.city || '',
                  pincode: addr.pincode || '',
                  landmark: addr.landmark || ''
                })
                toast.success('Address applied')
              }}
                className="cursor-pointer rounded-2xl border border-slate-200 p-4 hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">{addr.label}</span>
                  <span className="font-semibold text-slate-900">{addr.recipientName}</span>
                </div>
                <p className="text-xs text-slate-500">{addr.flatOrShopNumber}, {addr.buildingName}</p>
                <p className="text-xs text-slate-500">{addr.streetName}, {addr.area}</p>
                <p className="text-xs text-slate-500">{addr.city} - {addr.pincode}</p>
              </div>
            ))}
          </div>
          <div className="my-6 h-px w-full bg-slate-200"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={user?.savedAddresses?.length > 0 ? "mt-0 space-y-4" : "mt-6 space-y-4"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recipient name</span>
            <input
              name="recipientName"
              value={deliveryAddress.recipientName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</span>
            <input
              name="phone"
              value={deliveryAddress.phone}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Flat / Shop No.</span>
            <input
              name="flatOrShopNumber"
              value={deliveryAddress.flatOrShopNumber}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Building Name</span>
            <input
              name="buildingName"
              value={deliveryAddress.buildingName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Street Name</span>
          <input
            name="streetName"
            value={deliveryAddress.streetName}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Area</span>
            <input
              name="area"
              value={deliveryAddress.area}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">City</span>
            <input
              name="city"
              value={deliveryAddress.city}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pincode</span>
            <input
              name="pincode"
              value={deliveryAddress.pincode}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Landmark</span>
          <input
            name="landmark"
            value={deliveryAddress.landmark}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows="3"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment method</p>
          <div className="flex flex-wrap gap-3">
            {['cod', 'razorpay'].map((method) => (
              <label key={method} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method === 'cod' ? 'Cash on delivery' : 'Razorpay'}
              </label>
            ))}
          </div>
        </div>

        <div className="my-8 h-px w-full bg-slate-200"></div>

        <div className="mb-8 rounded-2xl bg-slate-50 p-6 border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-4">Order summary</p>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p>{item.quantity} × {item.unit}</p>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-slate-900">{formatCurrency(deliveryCharges)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
        >
          {loading ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </div>
  )
}

export default Checkout
