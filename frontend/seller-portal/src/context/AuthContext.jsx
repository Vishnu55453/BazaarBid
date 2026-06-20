import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('bb_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bb_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('bb_user')
      }
    }
    
    // Refresh user from backend if we have a token
    const tokenStr = localStorage.getItem('bb_token')
    if (tokenStr) {
      api.get('/api/auth/me')
        .then(res => {
          if (res.success && res.user) {
            setUser(res.user)
          }
        })
        .catch(err => console.error('Failed to fetch user', err))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('bb_token', token)
    } else {
      localStorage.removeItem('bb_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('bb_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('bb_user')
    }
  }, [user])

  const login = async ({ email, password }) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      setToken(response.token)
      setUser(response.user)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/register', payload)
      setToken(response.token)
      setUser(response.user)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bb_token')
    localStorage.removeItem('bb_user')
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    setIsLoading,
    setUser,
    login,
    register,
    logout
  }), [user, token, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
