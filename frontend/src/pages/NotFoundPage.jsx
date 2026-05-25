import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="card card-soft p-5 text-center">
    <h1 className="fw-bold">404</h1>
    <p className="text-secondary">Страница не найдена.</p>
    <Link className="btn btn-primary" to="/">Вернуться к ленте</Link>
  </div>
)

export default NotFoundPage
