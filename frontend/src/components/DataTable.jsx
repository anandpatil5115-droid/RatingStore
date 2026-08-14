import { AlertIcon } from './Icons';

function SortHeader({ label, sortKey, sortBy, order, onSort }) {
  return (
    <th
      className="sortable"
      onClick={() => onSort(sortKey)}
      aria-sort={sortBy === sortKey ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      {sortBy === sortKey && <span className="sort-ind">{order === 'asc' ? '▲' : '▼'}</span>}
    </th>
  );
}

export default function DataTable({
  columns,
  rows,
  keyFn,
  loading,
  error,
  empty: emptyTitle = 'No records found',
  emptyMessage,
  sortBy,
  order,
  onSort,
  onRetry,
  emptyAction,
}) {
  if (loading) {
    return (
      <div className="table-wrap">
        <div className="loading-block" role="status">
          <span className="spinner" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-wrap">
        <div style={{ padding: 20 }}>
          <div className="error-box">
            <AlertIcon size={18} />
            <div>
              <div>{error}</div>
              {onRetry && (
                <button type="button" className="btn btn-danger-soft btn-sm mt-1" onClick={onRetry}>
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state">
          <div className="es-icon" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
            <AlertIcon size={26} />
          </div>
          <h4>{emptyTitle}</h4>
          {emptyMessage && <p className="muted">{emptyMessage}</p>}
          {emptyAction && <div className="mt-2">{emptyAction}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) =>
              col.sortable ? (
                <SortHeader
                  key={col.key}
                  label={col.header}
                  sortKey={col.key}
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
              ) : (
                <th key={col.key}>{col.header}</th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyFn ? keyFn(row) : row.id}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}