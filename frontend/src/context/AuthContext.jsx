import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { authApi } from '../services/apiService'

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(readStoredUser)
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem('token')))

  const saveSession = useCallback((authData) => {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData))
    setToken(authData.token)
    setUser(authData)
  }, [])

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload)
    saveSession(data)
    return data
  }, [saveSession])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    saveSession(data)
    return data
  }, [saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const restore = async () => {
      if (!token) {
        setInitializing(false)
        return
      }
      try {
        const { data } = await authApi.me()
        saveSession(data)
      } catch {
        logout()
      } finally {
        setInitializing(false)
      }
    }
    restore()
  }, [token, saveSession, logout])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    initializing,
    login,
    register,
    logout
  }), [token, user, initializing, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
