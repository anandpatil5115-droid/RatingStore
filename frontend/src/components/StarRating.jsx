import { StarIcon } from './Icons';

function StarRating({ value = 0, onChange, sizeClass = '', disabled = false, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];

  if (readOnly) {
    return (
      <span className={`stars ${sizeClass}`} aria-label={`${value} out of 5 stars`}>
        {stars.map((n) => (
          <span key={n} className={`star disabled ${n <= Math.round(value) ? 'filled' : ''}`}>
            <StarIcon size={20} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`stars ${sizeClass}`}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          title={`${n} star${n > 1 ? 's' : ''}`}
        >
          <StarIcon size={20} />
        </button>
      ))}
    </span>
  );
}

export default StarRating;