import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import PostCard from '../components/PostCard'
import PostFilters from '../components/PostFilters'
import { postsApi, tagsApi } from '../services/apiService'

const emptyFilters = { q: '', tag: '', dateFrom: '', dateTo: '' }

const MyPostsPage = () => {
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [posts, setPosts] = useState([])
  const [tags, setTags] = useState([])
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTags = useCallback(async () => {
    const { data } = await tagsApi.list()
    setTags(data)
  }, [])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await postsApi.mine({ ...filters, page, size: 6 })
      setPosts(data.content || [])
      setPageInfo({ totalPages: data.totalPages || 0, totalElements: data.totalElements || 0 })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadTags().catch((err) => setError(getApiError(err)))
  }, [loadTags])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(0)
    loadPosts()
  }

  const handleReset = () => {
    setFilters(emptyFilters)
    setPage(0)
  }

  const handleLike = async (post) => {
    try {
      const { data } = await postsApi.toggleLike(post.id)
      setPosts((prev) => prev.map((item) => (item.id === data.id ? data : item)))
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const handleDelete = async (post) => {
    if (!window.confirm(`Удалить пост «${post.title}»?`)) return
    try {
      await postsApi.remove(post.id)
      setSuccess('Пост удалён')
      await loadPosts()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Мои посты</h1>
          <p className="text-secondary mb-0">Список постов текущего пользователя с поиском, тегами и датами.</p>
        </div>
        <Link className="btn btn-primary" to="/posts/new"><i className="bi bi-plus-lg me-1" />Создать пост</Link>
      </div>

      <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
      <AlertMessage type="success" onClose={() => setSuccess('')}>{success}</AlertMessage>

      <PostFilters filters={filters} onChange={setFilters} onSubmit={handleSearch} onReset={handleReset} tags={tags} showAuthor={false} />

      {loading ? <Loading /> : (
        <>
          {posts.length === 0 ? (
            <div className="card card-soft p-5 text-center text-secondary">У вас пока нет постов по выбранным условиям</div>
          ) : (
            <div className="row g-4">
              {posts.map((post) => (
                <div className="col-12 col-md-6 col-xl-4" key={post.id}>
                  <PostCard post={post} onLike={handleLike} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={pageInfo.totalPages} onChange={setPage} />
        </>
      )}
    </>
  )
}

export default MyPostsPage
