import { Link } from 'react-router-dom'

const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const PostCard = ({ post, onLike, onDelete }) => (
  <div className="card card-soft h-100">
    <div className="card-body d-flex flex-column">
      {post.imageUrl && (
        <img src={post.imageUrl} className="post-image mb-3" alt={post.title} onError={(event) => { event.currentTarget.style.display = 'none' }} />
      )}
      <div className="d-flex justify-content-between gap-2 align-items-start mb-2">
        <h2 className="h5 fw-bold mb-0">
          <Link to={`/posts/${post.id}`} className="text-decoration-none text-dark">{post.title}</Link>
        </h2>
        {post.editableByCurrentUser && <span className="badge text-bg-success">можно редактировать</span>}
      </div>
      <div className="small text-secondary mb-2">
        <i className="bi bi-person me-1" />{post.author?.username} · {formatDate(post.createdAt)}
      </div>
      <p className="text-secondary text-truncate-3 flex-grow-1">{post.content}</p>
      <div className="d-flex flex-wrap gap-1 mb-3">
        {post.tags?.map((tag) => <span key={tag} className="badge badge-tag">#{tag}</span>)}
      </div>
      <div className="d-flex flex-wrap gap-2 align-items-center mt-auto">
        <button className={`btn btn-sm ${post.likedByCurrentUser ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onLike?.(post)}>
          <i className="bi bi-heart-fill me-1" />{post.likesCount}
        </button>
        <Link className="btn btn-sm btn-outline-secondary" to={`/posts/${post.id}`}>
          <i className="bi bi-chat-left-text me-1" />{post.commentsCount}
        </Link>
        {post.editableByCurrentUser && (
          <>
            <Link className="btn btn-sm btn-outline-success" to={`/posts/${post.id}/edit`}>Редактировать</Link>
            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete?.(post)}>Удалить</button>
          </>
        )}
      </div>
    </div>
  </div>
)

export default PostCard
