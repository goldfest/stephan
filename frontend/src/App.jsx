import { Navigate, Route, Routes } from 'react-router-dom'
import AdminOnly from './components/AdminOnly'
import AppNavbar from './components/AppNavbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import AllPostsPage from './pages/AllPostsPage'
import CommentsPage from './pages/CommentsPage'
import LoginPage from './pages/LoginPage'
import MyPostsPage from './pages/MyPostsPage'
import NotFoundPage from './pages/NotFoundPage'
import PostDetailPage from './pages/PostDetailPage'
import PostFormPage from './pages/PostFormPage'
import RegisterPage from './pages/RegisterPage'
import UsersPage from './pages/UsersPage'

const GuestOnly = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

const App = () => (
  <>
    <AppNavbar />
    <main className="container page-shell">
      <Routes>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AllPostsPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/comments" element={<CommentsPage />} />
          <Route path="/posts/new" element={<PostFormPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id/edit" element={<PostFormPage />} />
          <Route path="/admin/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  </>
)

export default App
