export default function Loading({ label = 'Loading…', size = '' }) {
  return (
    <div className="loading-block" role="status">
      <span className={`spinner ${size === 'lg' ? 'lg' : ''}`} />
      <span>{label}</span>
    </div>
  );
}
