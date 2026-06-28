import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiShare, FiRefreshCcw, FiTruck, FiChevronRight, FiStar } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/helpers'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { fetchProductById } = useProducts()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
    // Add 1 minimum order qty by default
    addToCart(product, product.minimumOrderQty || 1)
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

  const images = product.images?.length > 0 ? product.images : [{ url: '' }]
  const activeImage = images[activeImageIndex]?.url

  const mrp = product.compareAtPrice || (product.pricePerUnit * 1.1) // fallback dummy MRP for display
  const discount = Math.max(0, mrp - product.pricePerUnit)

  return (
    <div className="max-w-6xl mx-auto py-0 text-sm">
      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[400px_1fr] items-start">

        {/* LEFT COLUMN: Gallery & Add to Cart */}
        <div className="flex flex-col gap-6 sticky top-24 self-start">
          <div className="flex gap-4">
            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="h-full w-full object-contain rounded-2xl" />
              ) : (
                <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl animate-pulse flex flex-col items-center justify-center gap-2">
                  <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 font-medium">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div>
            <button
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-slate-900 py-2 text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Stacked Info Cards */}
        <div className="flex flex-col gap-6">

          {/* Top Card: Main Details */}
          <div className="relative">
            {/* Seller/Brand Link */}
            <div className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer mb-0">
              {product.sellerShopName} <FiChevronRight className="w-3.5 h-3.5" />
            </div>

            <div className="font-semibold text-slate-900 leading-tight pr-12 mt-3">
              {product.name}
            </div>

            <div className="flex items-center gap-3 mt-4 font-medium text-slate-500">
              <span>Net Qty: {product.stock > 0 ? 'Available' : 'Out of stock'} ({product.minimumOrderQty} {product.unit} min)</span>
            </div>

            <div className="mt-6">
              <div className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-sm">
                {formatCurrency(product.pricePerUnit)}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-slate-500 font-medium">MRP</span>
                <span className="text-slate-400 line-through decoration-slate-300">{formatCurrency(mrp)}</span>
                <span className="text-slate-500">(incl. of all taxes)</span>
                {discount > 0 && (
                  <span className="font-bold text-emerald-600 ml-1">{formatCurrency(discount)} OFF</span>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full my-6"></div>

            {/* Product Specifications */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Product Specifications</h3>

              <div className="grid grid-cols-[130px_1fr] gap-y-3">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900 capitalize">{product.category.replace('_', ' ')}</span>

                <span className="text-slate-500">Unit</span>
                <span className="font-medium text-slate-900 capitalize">{product.unit}</span>

                <span className="text-slate-500">Available Stock</span>
                <span className="font-medium text-slate-900">{product.stock} {product.unit}</span>

                <span className="text-slate-500">Min Order Qty</span>
                <span className="font-medium text-slate-900">{product.minimumOrderQty} {product.unit}</span>

                {product.maximumOrderQty && (
                  <>
                    <span className="text-slate-500">Max Order Qty</span>
                    <span className="font-medium text-slate-900">{product.maximumOrderQty} {product.unit}</span>
                  </>
                )}

                {product.description && (
                  <>
                    <span className="text-slate-500">Description</span>
                    <span className="font-medium text-slate-900">{product.description}</span>
                  </>
                )}

                <span className="text-slate-500">Home Delivery</span>
                <span className="font-medium text-slate-900">
                  {product.deliveryAvailable !== false ? 'Available' : 'Not Available'}
                </span>

                {product.deliveryAvailable !== false && (
                  <>
                    <span className="text-slate-500">Delivery Charges</span>
                    <span className="font-medium text-slate-900">
                      {product.deliveryCharges === 0 ? 'Free Delivery' : (product.deliveryCharges ? `₹${product.deliveryCharges}` : 'Calculated at checkout')}
                    </span>

                    {product.freeDeliveryAbove && product.deliveryCharges > 0 && (
                      <>
                        <span className="text-slate-500">Free Delivery</span>
                        <span className="font-medium text-slate-900">On orders above ₹{product.freeDeliveryAbove}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full my-6"></div>

            {/* Seller Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Seller Information</h3>

              <div className="grid grid-cols-[130px_1fr] gap-y-3">
                <span className="text-slate-500">Shop Name</span>
                <span className="font-medium text-slate-900 capitalize">
                  {product.sellerShopName || product.sellerId?.kiranaProfile?.asSeller?.shopName || 'Kirana Store'}
                </span>

                <span className="text-slate-500">Owner Name</span>
                <span className="font-medium text-slate-900 capitalize">{product.sellerId?.name || 'N/A'}</span>

                {product.sellerId?.phone && (
                  <>
                    <span className="text-slate-500">Contact Number</span>
                    <span className="font-medium text-slate-900">{product.sellerId.phone}</span>
                  </>
                )}

                {product.sellerId?.location?.area && (
                  <>
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium text-slate-900">
                      {[product.sellerId.location.address, product.sellerId.location.area, product.sellerId.location.city, product.sellerId.location.pincode].filter(Boolean).join(', ')}
                    </span>
                  </>
                )}

                {product.sellerId?.kiranaProfile?.asSeller?.deliveryRadius && (
                  <>
                    <span className="text-slate-500">Delivery Radius</span>
                    <span className="font-medium text-slate-900">{product.sellerId.kiranaProfile.asSeller.deliveryRadius} km</span>
                  </>
                )}

                {product.sellerId?.kiranaProfile?.asBuyer?.gstNumber && (
                  <>
                    <span className="text-slate-500">GST Number</span>
                    <span className="font-medium text-slate-900 uppercase">{product.sellerId.kiranaProfile.asBuyer.gstNumber}</span>
                  </>
                )}

                <span className="text-slate-500">Business Type</span>
                <span className="font-medium text-slate-900">Verified Retailer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

