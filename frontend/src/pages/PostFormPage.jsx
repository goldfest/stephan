import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import { postsApi } from '../services/apiService'

const initialForm = { title: '', content: '', imageUrl: '', tags: '' }

const PostFormPage = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadPost = async () => {
      if (!isEdit) return
      setLoading(true)
      try {
        const { data } = await postsApi.getById(id)
        setForm({
          title: data.title || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
          tags: (data.tags || []).join(', ')
        })
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id, isEdit])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const validate = () => {
    if (form.title.trim().length < 3) return 'Заголовок должен быть не короче 3 символов'
    if (form.content.trim().length < 10) return 'Текст поста должен быть не короче 10 символов'
    if (form.imageUrl && form.imageUrl.length > 500) return 'Ссылка на изображение слишком длинная'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim(),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    }

    setSaving(true)
    setError('')
    try {
      const { data } = isEdit ? await postsApi.update(id, payload) : await postsApi.create(payload)
      navigate(`/posts/${data.id}`)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="card card-soft p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h3 fw-bold mb-1">{isEdit ? 'Редактирование поста' : 'Новый пост'}</h1>
              <p className="text-secondary mb-0">Поля проверяются на клиенте и на сервере через DTO.</p>
            </div>
            <Link className="btn btn-outline-secondary" to={isEdit ? `/posts/${id}` : '/my-posts'}>Назад</Link>
          </div>

          <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Заголовок</label>
              <input className="form-control" name="title" value={form.title} onChange={handleChange} minLength={3} maxLength={120} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Текст поста</label>
              <textarea className="form-control" name="content" rows="8" value={form.content} onChange={handleChange} minLength={10} maxLength={5000} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Ссылка на изображение</label>
              <input className="form-control" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." maxLength={500} />
            </div>
            <div className="mb-4">
              <label className="form-label">Теги</label>
              <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="spring, react, exam" />
              <div className="form-text">Введите через запятую, максимум 8 тегов.</div>
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostFormPage
