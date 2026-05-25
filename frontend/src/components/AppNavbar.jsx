import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AppNavbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top navbar-blur">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-chat-square-heart me-2 text-primary" />
          Social Exam
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          {isAuthenticated && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Все посты</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-posts">Мои посты</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/posts/new">Создать пост</NavLink>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/users">Пользователи</NavLink>
                </li>
              )}
            </ul>
          )}
          <div className="d-flex align-items-center gap-2 ms-auto">
            {isAuthenticated ? (
              <>
                <span className="text-secondary small">
                  <i className="bi bi-person-circle me-1" />
                  {user?.username} · {user?.role}
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Выйти</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary btn-sm" to="/login">Войти</Link>
                <Link className="btn btn-primary btn-sm" to="/register">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
