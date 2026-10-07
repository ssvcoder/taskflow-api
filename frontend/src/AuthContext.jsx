import { createContext, useContext, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taskflow_user'))
    } catch {
      return null
    }
  })

  const saveSession = ({ token, username, email }) => {
    localStorage.setItem('taskflow_token', token)
    localStorage.setItem('taskflow_user', JSON.stringify({ username, email }))
    setUser({ username, email })
  }

  const login = async (email, password) => {
    const data = await api.login(email, password)
    saveSession(data)
  }

  const register = async (username, email, password) => {
    const data = await api.register(username, email, password)
    saveSession(data)
  }

  const logout = () => {
    localStorage.removeItem('taskflow_token')
    localStorage.removeItem('taskflow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
