const ROLE_LABELS = {
  SYSTEM_ADMIN: 'System Admin',
  NORMAL_USER: 'Normal User',
  STORE_OWNER: 'Store Owner',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || '—';
}

export function roleBadgeClass(role) {
  if (role === 'SYSTEM_ADMIN') return 'badge-admin';
  if (role === 'STORE_OWNER') return 'badge-owner';
  return 'badge-user';
}

export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAvg(value) {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(1);
}