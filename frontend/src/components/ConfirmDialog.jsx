import Modal from './Modal';
import { AlertIcon } from './Icons';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', danger = true, busy = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex" style={{ gap: 12 }}>
        <AlertIcon size={26} />
        <p style={{ margin: 0, lineHeight: 1.5 }}>{message}</p>
      </div>
    </Modal>
  );
}