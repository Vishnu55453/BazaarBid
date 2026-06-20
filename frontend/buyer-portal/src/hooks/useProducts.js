import { useCallback, useState } from 'react'
import api from '../services/api'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/api/products', params)
      setProducts(response.products || [])
      setPagination(response.pagination || { page: 1, limit: 12, total: 0, pages: 1 })
      return response
    } catch (error) {
      setError(error.message)
      setProducts([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProductById = useCallback(async (id) => {
    const response = await api.get(`/api/products/${id}`)
    return response.product
  }, [])

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    fetchProductById
  }
}
