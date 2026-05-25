import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import { commentsApi, postsApi } from '../services/apiService'

const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [page, setPage] = useState(0)
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPost = useCallback(async () => {
    const { data } = await postsApi.getById(id)
    setPost(data)
  }, [id])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    try {
      const { data } = await commentsApi.byPost(id, page, 10)
      setComments(data.content || [])
      setPageInfo({ totalPages: data.totalPages || 0, totalElements: data.totalElements || 0 })
    } finally {
      setCommentsLoading(false)
    }
  }, [id, page])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        await Promise.all([loadPost(), loadComments()])
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [loadPost, loadComments])

  const handleLike = async () => {
    try {
      const { data } = await postsApi.toggleLike(id)
      setPost(data)
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Удалить этот пост?')) return
    try {
      await postsApi.remove(id)
      navigate('/my-posts', { replace: true })
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const handleCreateComment = async (event) => {
    event.preventDefault()
    if (commentText.trim().length < 2) {
      setError('Комментарий должен быть не короче 2 символов')
      return
    }
    try {
      await commentsApi.create(id, { text: commentText.trim() })
      setCommentText('')
      setSuccess('Комментарий добавлен')
      await Promise.all([loadPost(), loadComments()])
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditingText(comment.text)
  }

  const handleUpdateComment = async (commentId) => {
    if (editingText.trim().length < 2) {
      setError('Комментарий должен быть не короче 2 символов')
      return
    }
    try {
      await commentsApi.update(commentId, { text: editingText.trim() })
      setEditingId(null)
      setEditingText('')
      setSuccess('Комментарий обновлён')
      await loadComments()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return
    try {
      await commentsApi.remove(commentId)
      setSuccess('Комментарий удалён')
      await Promise.all([loadPost(), loadComments()])
    } catch (err) {
      setError(getApiError(err))
    }
  }

  if (loading) return <Loading />

  if (!post) {
    return <AlertMessage type="danger">Пост не найден</AlertMessage>
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
        <AlertMessage type="success" onClose={() => setSuccess('')}>{success}</AlertMessage>

        <article className="card card-soft p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
            <div>
              <Link to="/" className="text-decoration-none small"><i className="bi bi-arrow-left" /> к ленте</Link>
              <h1 className="fw-bold mt-2 mb-2">{post.title}</h1>
              <div className="text-secondary">
                Автор: <b>{post.author?.username}</b> · {formatDate(post.createdAt)}
              </div>
            </div>
            {post.editableByCurrentUser && (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-success" to={`/posts/${post.id}/edit`}>Редактировать</Link>
                <button className="btn btn-outline-danger" onClick={handleDeletePost}>Удалить</button>
              </div>
            )}
          </div>

          {post.imageUrl && (
            <img src={post.imageUrl} className="post-image mb-4" alt={post.title} onError={(event) => { event.currentTarget.style.display = 'none' }} />
          )}
          <p className="fs-5" style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {post.tags?.map((tag) => <span key={tag} className="badge badge-tag">#{tag}</span>)}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button className={`btn ${post.likedByCurrentUser ? 'btn-primary' : 'btn-outline-primary'}`} onClick={handleLike}>
              <i className="bi bi-heart-fill me-1" />{post.likedByCurrentUser ? 'Нравится' : 'Лайк'} · {post.likesCount}
            </button>
            <span className="text-secondary"><i className="bi bi-chat-left-text me-1" />Комментариев: {post.commentsCount}</span>
          </div>
        </article>

        <section className="card card-soft p-4">
          <h2 className="h4 fw-bold mb-3">Комментарии к посту</h2>
          <form onSubmit={handleCreateComment} className="mb-4">
            <label className="form-label">Новый комментарий</label>
            <textarea className="form-control mb-2" rows="3" value={commentText} onChange={(e) => setCommentText(e.target.value)} minLength={2} maxLength={1500} required />
            <button className="btn btn-primary">Отправить</button>
          </form>

          {commentsLoading ? <Loading text="Загружаем комментарии..." /> : (
            <>
              {comments.length === 0 ? (
                <div className="text-secondary text-center py-4">Комментариев пока нет</div>
              ) : comments.map((comment) => (
                <div className="border rounded-4 p-3 mb-3" key={comment.id}>
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <div className="small text-secondary">
                      <b>{comment.author?.username}</b> · {formatDate(comment.createdAt)}
                    </div>
                    {comment.editableByCurrentUser && (
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-success" onClick={() => startEdit(comment)}>Изменить</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div>
                      <textarea className="form-control mb-2" rows="3" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleUpdateComment(comment.id)}>Сохранить</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Отмена</button>
                    </div>
                  ) : (
                    <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{comment.text}</p>
                  )}
                </div>
              ))}
              <Pagination page={page} totalPages={pageInfo.totalPages} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default PostDetailPage
