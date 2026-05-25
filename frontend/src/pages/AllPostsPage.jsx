import { useCallback, useEffect, useState } from 'react'
import { getApiError } from '../api/axiosClient'
import AlertMessage from '../components/AlertMessage'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import PostCard from '../components/PostCard'
import PostFilters from '../components/PostFilters'
import { postsApi, tagsApi, usersApi } from '../services/apiService'

const emptyFilters = { q: '', authorId: '', tag: '', dateFrom: '', dateTo: '' }

const AllPostsPage = () => {
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [posts, setPosts] = useState([])
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 })
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDictionaries = useCallback(async () => {
    const [usersResponse, tagsResponse] = await Promise.all([usersApi.list(), tagsApi.list()])
    setUsers(usersResponse.data)
    setTags(tagsResponse.data)
  }, [])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await postsApi.search({ ...filters, page, size: 6 })
      setPosts(data.content || [])
      setPageInfo({ totalPages: data.totalPages || 0, totalElements: data.totalElements || 0 })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadDictionaries().catch((err) => setError(getApiError(err)))
  }, [loadDictionaries])

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
          <h1 className="fw-bold mb-1">Публичная лента</h1>
          <p className="text-secondary mb-0">Поиск по названию/тексту, фильтр по автору, тегу и диапазону дат.</p>
        </div>
        <span className="badge text-bg-light fs-6">Найдено: {pageInfo.totalElements}</span>
      </div>

      <AlertMessage type="danger" onClose={() => setError('')}>{error}</AlertMessage>
      <AlertMessage type="success" onClose={() => setSuccess('')}>{success}</AlertMessage>

      <PostFilters filters={filters} onChange={setFilters} onSubmit={handleSearch} onReset={handleReset} users={users} tags={tags} showAuthor />

      {loading ? <Loading /> : (
        <>
          {posts.length === 0 ? (
            <div className="card card-soft p-5 text-center text-secondary">Посты не найдены</div>
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

export default AllPostsPage
