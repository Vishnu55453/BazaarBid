import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../components/common/Loader'
import api from '../services/api'
import { formatCurrency } from '../utils/helpers'

const SellerDetail = () => {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/auth/sellers')
        const current = (response.sellers || []).find((item) => item.id === id)
        setSeller(current)

        if (current) {
          const productsResponse = await api.get('/api/products', { sellerId: id, limit: 6 })
          setProducts(productsResponse.products || [])
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <Loader className="h-64" />
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error || 'Seller not found'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Seller detail</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{seller.shopName || seller.name}</h1>
        <p className="mt-2 text-sm text-slate-500">Owned by {seller.name}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rating</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{seller.rating?.average || 0}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Type</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{seller.role === 'kirana_user' ? 'Kirana' : 'Big market'}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{seller.location?.area || 'Local'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Catalog</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Popular products</h2>
          </div>
          <Link to="/products" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Browse all products
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No products available from this seller right now.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="rounded-[22px] border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">{formatCurrency(product.pricePerUnit)} / {product.unit}</p>
                <Link to={`/products/${product._id}`} className="mt-4 inline-flex text-sm font-semibold text-indigo-600">
                  View product
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDetail
