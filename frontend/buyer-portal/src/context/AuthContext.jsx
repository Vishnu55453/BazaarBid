import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bb_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        localStorage.removeItem('bb_user')
      }
    }
    return null
  })
  const [token, setToken] = useState(() => localStorage.getItem('bb_token'))
  const [activePincode, setActivePincode] = useState(() => localStorage.getItem('bb_pincode') || '')
  const [isLoading, setIsLoading] = useState(false)

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

  useEffect(() => {
    if (activePincode) {
      localStorage.setItem('bb_pincode', activePincode)
    } else {
      localStorage.removeItem('bb_pincode')
    }
  }, [activePincode])

  const login = async ({ email, password }) => {
    const response = await api.post('/api/auth/login', { email, password })
    setToken(response.token)
    setUser(response.user)
    
    // Automatically set pincode on login if available
    if (response.user?.location?.pincode) {
      setActivePincode(response.user.location.pincode)
    } else if (response.user?.savedAddresses?.[0]?.pincode) {
      setActivePincode(response.user.savedAddresses[0].pincode)
    }
    
    return response
  }

  const register = async (payload) => {
    const response = await api.post('/api/auth/register', payload)
    setToken(response.token)
    setUser(response.user)
    if (response.user?.location?.pincode) {
      setActivePincode(response.user.location.pincode)
    }
    return response
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setActivePincode('')
  }

  const value = useMemo(() => ({
    user,
    token,
    activePincode,
    setActivePincode,
    isAuthenticated: Boolean(token && user),
    isLoading,
    setIsLoading,
    setUser,
    login,
    register,
    logout
  }), [user, token, activePincode, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
