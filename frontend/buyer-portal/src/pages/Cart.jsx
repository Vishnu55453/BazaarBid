import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/helpers'

const Cart = () => {
  const { cartItems, subtotal, deliveryCharges, total, updateQuantity, removeFromCart, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Your cart</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add a few essentials from the product catalog to get started.</p>
        <Link
          to="/products"
          className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Cart</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Review your basket</h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Clear cart
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-slate-200 p-4">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.sellerName}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(item.price)} / {item.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="h-9 w-9 rounded-full border border-slate-200 text-lg"
                >
                  -
                </button>
                <span className="min-w-10 text-center font-semibold text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="h-9 w-9 rounded-full border border-slate-200 text-lg"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Summary</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery</span>
            <span className="font-semibold text-slate-900">{formatCurrency(deliveryCharges)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}

export default Cart
