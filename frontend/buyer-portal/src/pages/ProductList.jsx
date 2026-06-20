import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import Loader from '../components/common/Loader'
import { categories, sellerTypes, sortOptions } from '../utils/constants'
import { formatCurrency } from '../utils/helpers'

const ProductList = () => {
  const { addToCart } = useCart()
  const { products, pagination, loading, error, fetchProducts } = useProducts()
  const [category, setCategory] = useState('')
  const [sellerType, setSellerType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortKey, setSortKey] = useState('createdAt-desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchProducts({
      page,
      limit: 12,
      category,
      sellerType,
      search: debouncedSearch,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: sortKey.split('-')[0],
      sortOrder: sortKey.split('-')[1]
    }).catch(() => {})
  }, [category, sellerType, debouncedSearch, priceRange.min, priceRange.max, sortKey, page, fetchProducts])

  const sellerTypeLabel = useMemo(() => {
    const option = sellerTypes.find((item) => item.value === sellerType)
    return option?.label || 'All sellers'
  }, [sellerType])

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Browse products</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Fresh finds and everyday essentials</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Search by product, filter by category or seller type, and build your cart from trusted local sellers.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{pagination.total}</span> products available
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by product or keyword"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Seller type</span>
            <select
              value={sellerType}
              onChange={(event) => setSellerType(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {sellerTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {sortOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Min price</span>
            <input
              type="number"
              min="0"
              value={priceRange.min}
              onChange={(event) => setPriceRange((current) => ({ ...current, min: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Max price</span>
            <input
              type="number"
              min="0"
              value={priceRange.max}
              onChange={(event) => setPriceRange((current) => ({ ...current, max: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              placeholder="500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">{sellerTypeLabel}</span>
          {category ? <span className="rounded-full bg-slate-100 px-3 py-1">{categories.find((item) => item.value === category)?.label}</span> : null}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <Loader className="h-60" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-slate-500">No image</span>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{product.sellerShopName}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {product.stock} in stock
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{product.description || 'Fresh and reliable quality.'}</p>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{formatCurrency(product.pricePerUnit)}</p>
                  <p className="text-xs text-slate-500">per {product.unit}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add to cart
                  </button>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-center text-sm font-semibold text-indigo-600"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
          No products matched your filters. Try adjusting the search or category.
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
            disabled={page === pagination.pages}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductList
