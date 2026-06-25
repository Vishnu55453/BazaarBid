import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Lock } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function MarketInsights() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('vegetables')
  const [error, setError] = useState('')

  const canViewAnalytics = user?.features?.canViewAnalytics

  useEffect(() => {
    if (!canViewAnalytics) {
      setLoading(false)
      return
    }
    
    const fetchTrends = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/analytics/price-trends?category=${category}`)
        if (res.success) {
          setData(res.chartData)
        }
      } catch (err) {
        if (err.requiresUpgrade) {
          setError(err.message)
        } else {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchTrends()
  }, [category, canViewAnalytics])

  if (!canViewAnalytics) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Premium Market Insights</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Upgrade your plan to unlock real-time price trends, budget forecasts, and advanced market intelligence to optimize your sourcing costs.
          </p>
          <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-200 transition">
            Upgrade Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Track average winning bids to plan your sourcing budget</p>
        </div>
        <select 
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="vegetables">Vegetables</option>
          <option value="fruits">Fruits</option>
          <option value="grains">Grains & Pulses</option>
          <option value="dairy">Dairy Products</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800">30-Day Price Trend (₹/kg)</h3>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 font-medium">Loading trends...</div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-red-500 font-medium">{error}</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="averagePrice" 
                  name="Avg Price (₹)"
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
