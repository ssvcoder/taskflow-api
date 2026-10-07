import { useState } from 'react'
import { useAuth } from './AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

export default function App() {
  const { user } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  if (!user) {
    return mode === 'login' ? (
      <Login onSwitch={() => setMode('register')} />
    ) : (
      <Register onSwitch={() => setMode('login')} />
    )
  }

  return <Dashboard />
}
