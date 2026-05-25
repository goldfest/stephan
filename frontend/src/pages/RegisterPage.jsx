import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import { useAuth } from '../hooks/useAuth'

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const validate = () => {
    if (form.username.trim().length < 3) return 'Логин должен быть не короче 3 символов'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Введите корректный email'
    if (form.password.length < 6) return 'Пароль должен быть не короче 6 символов'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password })
      navigate('/', { replace: true })
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
          <h1 className="h3 fw-bold mb-2">Регистрация</h1>
          <p className="text-secondary">После регистрации пользователь сразу получает роль USER.</p>
          <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Логин</label>
              <input className="form-control" name="username" value={form.username} onChange={handleChange} minLength={3} maxLength={60} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Пароль</label>
              <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Создаём...' : 'Создать аккаунт'}
            </button>
          </form>
          <div className="text-center mt-3">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
