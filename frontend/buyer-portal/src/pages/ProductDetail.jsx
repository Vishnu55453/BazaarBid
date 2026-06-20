import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Loader from '../components/common/Loader'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/helpers'

const ProductDetail = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { fetchProductById } = useProducts()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const current = await fetchProductById(id)
        setProduct(current)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [fetchProductById, id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity)
    toast.success(`${product.name} added to cart`)
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <Loader className="h-64" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error || 'Product not found'}
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[24px] bg-slate-100">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-slate-500">No image available</div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">{product.category}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-3 text-sm text-slate-600">{product.description || 'Freshly picked and carefully packed for everyday use.'}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(product.pricePerUnit)}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Availability</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{product.stock} {product.unit}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Seller:</span> {product.sellerShopName}</p>
              <p className="mt-2"><span className="font-semibold text-slate-900">Minimum order:</span> {product.minimumOrderQty} {product.unit}</p>
              <p className="mt-2"><span className="font-semibold text-slate-900">Seller type:</span> {product.sellerType}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Order now</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Prepare your order</h2>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quantity</span>
            <input
              type="number"
              min={product.minimumOrderQty || 1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>Subtotal: <span className="font-semibold text-slate-900">{formatCurrency(product.pricePerUnit * quantity)}</span></p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Add {quantity} {product.unit} to cart
          </button>

          <Link to="/products" className="block text-center text-sm font-semibold text-indigo-600">
            Back to products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
