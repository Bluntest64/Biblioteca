function Modal({ titulo, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">{titulo}</h2>
          <button className="modal-close" type="button" aria-label="Cerrar" onClick={onClose}>x</button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default Modal;
