import { StoreIcon } from './Icons';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <div className="es-icon">
        <StoreIcon size={28} />
      </div>
      <h4>{title}</h4>
      {message && <p className="muted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}