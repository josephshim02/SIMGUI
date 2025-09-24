
const Modal = ({onClose, onSimulate, onNotify}) => {
  return (
    
    <div
      className="modal-overlay"
      onClick={onClose} // close when clicking outside
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={(e) => {
          e.preventDefault();
          onNotify();
          onSimulate();
          onClose();
        }}>
          <h2>Choose simulation parameters</h2>
          <label>
            Duration:
            <input id="duration" type="number" name="duration" defaultValue="5" required />
          </label>

          <button type="submit">Start Simulation</button>
        </form>
      </div>
    </div>
  
  )
};
export default Modal;
