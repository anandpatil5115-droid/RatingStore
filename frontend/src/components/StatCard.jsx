export default function StatCard({ label, value, icon, tone = 'var(--brand)' }) {
  const tintMap = {
    'var(--brand)': 'rgba(79, 70, 229, 0.12)',
    'var(--ok)': 'rgba(22, 163, 74, 0.12)',
    'var(--warn)': 'rgba(217, 119, 6, 0.12)',
    'var(--info)': 'rgba(2, 132, 199, 0.12)',
    'var(--danger)': 'rgba(220, 38, 38, 0.12)',
  };
  return (
    <div className="stat-card" style={{ ['--tone']: tone, ['--tint']: tintMap[tone] || 'rgba(79,70,229,0.12)' }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}