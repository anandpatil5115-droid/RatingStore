import { useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import Field from './Field';
import { validateRating } from '../utils/validators';

export default function RatingModal({ open, onClose, store, existing, busy, onSubmit }) {
  const [value, setValue] = useState(existing || 0);
  const [error, setError] = useState('');

  const isModify = existing != null;

  const handleConfirm = () => {
    const err = validateRating(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onSubmit(value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isModify ? 'Modify your rating' : `Rate ${store?.name || 'this store'}`}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isModify ? 'btn-primary' : 'btn-success'}`}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? 'Saving…' : isModify ? 'Update rating' : 'Submit rating'}
          </button>
        </>
      }
    >
      <Field label={`Your rating${isModify ? ' (currently ' + existing + ')' : ''}`} error={error}>
        <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
          <StarRating value={value} onChange={(v) => { setValue(v); setError(''); }} sizeClass="stars-lg" />
          <span className="rating-value">{value ? `${value} / 5` : ''}</span>
        </div>
      </Field>
      <p className="muted" style={{ fontSize: 13 }}>
        Ratings must be an integer between 1 (poor) and 5 (excellent). You can only rate a store once — a new
        submission will update your existing rating.
      </p>
    </Modal>
  );
}