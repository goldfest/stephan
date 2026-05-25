import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.username.trim() || form.password.length < 6) {
      setError('Введите логин и пароль длиной не менее 6 символов')
      return
    }
    setLoading(true)
    try {
      await login({ username: form.username.trim(), password: form.password })
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-7 col-lg-5">
        <div className="card card-soft p-4">
          <h1 className="h3 fw-bold mb-2">Вход в систему</h1>
          <p className="text-secondary">Демо-логины: <b>admin/admin123</b>, <b>ivan/user123</b>.</p>
          <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Логин</label>
              <input className="form-control" name="username" value={form.username} onChange={handleChange} minLength={3} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Пароль</label>
              <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <div className="text-center mt-3">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
