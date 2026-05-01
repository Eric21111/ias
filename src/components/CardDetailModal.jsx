import './CardDetailModal.css'

function CardDetailModal({ open, title, step, onClose, children }) {
  if (!open) return null

  return (
    <div className="card-modal-overlay" onClick={onClose} role="presentation">
      <div className="card-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="card-modal-header">
          <span className="card-modal-step">Step {step}</span>
          <button type="button" className="card-modal-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="card-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default CardDetailModal
