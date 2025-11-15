import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Modo de desenvolvimento: defina como true para desabilitar proteção temporariamente
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Modo de desenvolvimento: permite acesso sem autenticação
  if (DEV_MODE) {
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute


