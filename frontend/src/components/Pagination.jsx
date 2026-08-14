import { ChevronLeft, ChevronRight } from './Icons';

function pageList(current, total) {
  const pages = [];
  const add = (p) => pages.push(p);
  for (let p = 1; p <= total; p += 1) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      add(p);
    } else if (pages[pages.length - 1] !== '…') {
      add('…');
    }
  }
  return pages;
}

export default function Pagination({ page = 1, totalPages = 1, total = 0, limit = 10, onPageChange }) {
  if (totalPages <= 1 && total === 0) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="page-info">
        Showing {from}–{to} of {total}
      </span>
      {totalPages > 1 && (
        <div className="page-btns">
          <button
            type="button"
            className="page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>
          {pageList(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--muted)' }}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}