import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import { commentsApi, postsApi } from '../services/apiService'

const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const CommentsPage = () => {
  const [posts, setPosts] = useState([])
  const [postId, setPostId] = useState('')
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(0)
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPosts = useCallback(async () => {
    const { data } = await postsApi.search({ page: 0, size: 50 })
    setPosts(data.content || [])
  }, [])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    setError('')

    try {
      const { data } = await commentsApi.search({
        postId,
        page,
        size: 10
      })

      setComments(data.content || [])
      setPageInfo({
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setCommentsLoading(false)
    }
  }, [postId, page])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError('')

      try {
        await loadPosts()
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [loadPosts])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handlePostChange = (event) => {
    setPostId(event.target.value)
    setPage(0)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-10">
        <div className="card card-soft p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h1 className="fw-bold mb-1">Комментарии</h1>
              <p className="text-secondary mb-0">
                Фильтрация комментариев по выбранному посту
              </p>
            </div>
            <div className="badge bg-primary-subtle text-primary fs-6">
              Найдено: {pageInfo.totalElements}
            </div>
          </div>

          <AlertMessage type="danger" onClose={() => setError('')}>
            {error}
          </AlertMessage>

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label">Пост</label>
              <select
                className="form-select"
                value={postId}
                onChange={handlePostChange}
              >
                <option value="">Все посты</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setPostId('')
                  setPage(0)
                }}
              >
                Сбросить фильтр
              </button>
            </div>
          </div>
        </div>

        <section className="card card-soft p-4">
          {commentsLoading ? (
            <Loading text="Загружаем комментарии..." />
          ) : comments.length === 0 ? (
            <div className="text-secondary text-center py-4">
              Комментарии не найдены
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div className="border rounded-4 p-3 mb-3" key={comment.id}>
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <div className="small text-secondary">
                      <b>{comment.author?.username}</b> · {formatDate(comment.createdAt)}
                    </div>

                    <Link
                      className="small text-decoration-none"
                      to={`/posts/${comment.postId}`}
                    >
                      Перейти к посту
                    </Link>
                  </div>

                  <div className="mb-2">
                    <span className="text-secondary">Пост: </span>
                    <b>{comment.postTitle}</b>
                  </div>

                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {comment.text}
                  </p>
                </div>
              ))}

              <Pagination
                page={page}
                totalPages={pageInfo.totalPages}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default CommentsPage
