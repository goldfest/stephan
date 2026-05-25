import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AdminOnly = ({ children }) => {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/" replace />
}

export default AdminOnly
