import { useCallback, useEffect, useState } from 'react'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../services/apiService'

const formatDate = (value) => value ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(value)) : ''

const UsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await usersApi.list()
      setUsers(data)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadUsers()
  }, [])

  const changeRole = async (id, role) => {
    try {
      await usersApi.updateRole(id, role)
      setSuccess('Роль обновлена')
      await loadUsers()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const removeUser = async (target) => {
    if (!window.confirm(`Удалить пользователя ${target.username}? Его посты, комментарии и лайки тоже будут удалены.`)) return
    try {
      await usersApi.remove(target.id)
      setSuccess('Пользователь удалён')
      await loadUsers()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Администрирование пользователей</h1>
        <p className="text-secondary mb-0">Разграничение доступа: только ADMIN может менять роли и удалять пользователей.</p>
      </div>

      <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
      <AlertMessage type="success" onClose={() => setSuccess('')}>{success}</AlertMessage>

      {loading ? <Loading /> : (
        <div className="card card-soft">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Логин</th>
                  <th>Email</th>
                  <th>Дата регистрации</th>
                  <th>Роль</th>
                  <th className="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="fw-semibold">{item.username}</td>
                    <td>{item.email}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <select className="form-select form-select-sm" value={item.role} disabled={item.id === currentUser?.id} onChange={(e) => changeRole(item.id, e.target.value)}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" disabled={item.id === currentUser?.id} onClick={() => removeUser(item)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersPage
