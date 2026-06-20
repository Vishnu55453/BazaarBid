import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'
import api from '../services/api'

const SellersList = () => {
  const [sellers, setSellers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/auth/sellers')
        setSellers(response.sellers || [])
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = sellers.filter((seller) => {
    const haystack = `${seller.name || ''} ${seller.shopName || ''} ${seller.marketName || ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Sellers</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Find trusted local sellers</h1>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by seller name or shop"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md"
        />
      </div>

      {error && (
        <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
          <Loader className="h-48" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((seller) => (
            <div key={seller.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{seller.role === 'kirana_user' ? 'Kirana' : 'Big market'}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{seller.shopName || seller.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{seller.name}</p>
              <div className="mt-4 text-sm text-slate-600">
                <p>Rating: {seller.rating?.average || 0}</p>
                <p>{seller.location?.area || 'Location unavailable'}</p>
                {seller.marketName ? <p>{seller.marketName}</p> : null}
              </div>
              <Link
                to={`/sellers/${seller.id}`}
                className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                View seller
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SellersList
