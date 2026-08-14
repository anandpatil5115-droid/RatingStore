export default function Badge({ label, variant = 'muted' }) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}