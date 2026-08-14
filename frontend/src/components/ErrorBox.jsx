import { AlertIcon } from './Icons';

export default function ErrorBox({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-box" role="alert">
      <AlertIcon size={18} />
      <div>
        <div>{message}</div>
        {onRetry && (
          <button type="button" className="btn btn-danger-soft btn-sm mt-1" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}