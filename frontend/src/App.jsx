import { useState } from 'react'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import Register from './components/Register'
import Home from './components/Home'

function App() {
  const [currentScreen, setCurrentScreen] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Se autenticado, mostrar Home
  if (isAuthenticated) {
    return <Home />
  }

  if (currentScreen === 'forgotPassword') {
    return <ForgotPassword onBack={() => setCurrentScreen('login')} />
  }

  if (currentScreen === 'register') {
    return <Register onBack={() => setCurrentScreen('login')} />
  }

  return (
    <Login
      onForgotPassword={() => setCurrentScreen('forgotPassword')}
      onRegister={() => setCurrentScreen('register')}
      onLogin={() => setIsAuthenticated(true)}
    />
  )
}

export default App

