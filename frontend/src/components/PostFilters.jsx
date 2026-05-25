const PostFilters = ({ filters, onChange, onSubmit, onReset, users = [], tags = [], showAuthor = true }) => {
  const change = (name, value) => onChange({ ...filters, [name]: value })

  return (
    <form className="card card-soft p-3 mb-4" onSubmit={onSubmit}>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-lg-3">
          <label className="form-label">Поиск по тексту</label>
          <input className="form-control" value={filters.q || ''} onChange={(e) => change('q', e.target.value)} placeholder="заголовок или содержание" />
        </div>
        {showAuthor && (
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label">Автор</label>
            <select className="form-select" value={filters.authorId || ''} onChange={(e) => change('authorId', e.target.value)}>
              <option value="">Все</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
            </select>
          </div>
        )}
        <div className="col-12 col-sm-6 col-lg-2">
          <label className="form-label">Тег</label>
          <select className="form-select" value={filters.tag || ''} onChange={(e) => change('tag', e.target.value)}>
            <option value="">Все</option>
            {tags.map((tag) => <option key={tag.id || tag.name} value={tag.name}>{tag.name}</option>)}
          </select>
        </div>
        <div className="col-6 col-lg-2">
          <label className="form-label">Дата от</label>
          <input type="date" className="form-control" value={filters.dateFrom || ''} onChange={(e) => change('dateFrom', e.target.value)} />
        </div>
        <div className="col-6 col-lg-2">
          <label className="form-label">Дата до</label>
          <input type="date" className="form-control" value={filters.dateTo || ''} onChange={(e) => change('dateTo', e.target.value)} />
        </div>
        <div className="col-12 col-lg-1 d-grid gap-2">
          <button className="btn btn-primary" type="submit">Найти</button>
          <button className="btn btn-outline-secondary" type="button" onClick={onReset}>Сброс</button>
        </div>
      </div>
    </form>
  )
}

export default PostFilters
