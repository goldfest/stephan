const Pagination = ({ page, totalPages, onChange }) => {
  if (!totalPages || totalPages <= 1) return null

  return (
    <nav className="d-flex justify-content-center mt-4" aria-label="Пагинация">
      <ul className="pagination gap-1">
        <li className={`page-item ${page <= 0 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>Назад</button>
        </li>
        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index} className={`page-item ${index === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onChange(index)}>{index + 1}</button>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>Вперёд</button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
