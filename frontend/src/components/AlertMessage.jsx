const AlertMessage = ({ type = 'info', children, onClose }) => {
  if (!children) return null
  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      <div style={{ whiteSpace: 'pre-line' }}>{children}</div>
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />}
    </div>
  )
}

export default AlertMessage
