import { useCallback, useEffect, useState } from 'react';
import { getOwnerDashboard, listStoreRatings } from '../../services/ownerApi';
import { formatAvg, formatDate } from '../../utils/format';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import StarRating from '../../components/StarRating';
import { MapPinIcon, StoreIcon } from '../../components/Icons';

const PAGE_SIZE = 10;

export default function OwnerDashboard() {
  const [dash, setDash] = useState(null);
  const [dashError, setDashError] = useState('');

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOwnerDashboard()
      .then((res) => setDash(res))
      .catch((err) => setDashError(err.message));
  }, []);

  const loadRatings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStoreRatings({ page, limit: PAGE_SIZE, sortBy, order });
      setRatings(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setOrder('asc');
    }
    setPage(1);
  };

  const columns = [
    { key: 'userName', header: 'User name', sortable: true, render: (r) => <span className="td-primary">{r.user.name}</span> },
    { key: 'userEmail', header: 'Email', sortable: true, render: (r) => <span className="td-muted">{r.user.email}</span> },
    { key: 'address', header: 'Address', render: (r) => <span style={{ maxWidth: 220, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{r.user.address || '—'}</span> },
    { key: 'rating', header: 'Rating', sortable: true, render: (r) => <StarRating value={r.rating} readOnly sizeClass="stars-sm" /> },
    { key: 'createdAt', header: 'Rating date', sortable: true, render: (r) => <span className="td-muted">{formatDate(r.createdAt)}</span> },
  ];

  if (dashError) {
    return (
      <div>
        <div className="page-head">
          <h1 className="page-title">Store owner dashboard</h1>
        </div>
        <div className="card card-pad" style={{ color: 'var(--danger)' }}>{dashError}</div>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="card">
        <Loading label="Loading dashboard…" />
      </div>
    );
  }

  const pct = dash.averageRating != null ? (dash.averageRating / 5) * 100 : 0;
  const maxCount = Math.max(1, ...Object.values(dash.ratingBreakdown || { 1: 0 }));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Store owner dashboard</h1>
          <p className="page-sub">Monitor how customers rate your store.</p>
        </div>
      </div>

      <div className="card card-pad mb-2">
        <div className="owner-hero">
          <div className="avg-ring" style={{ ['--pct']: pct }}>
            <div className="ring-inner">
              <div className="ring-val">{dash.averageRating != null ? formatAvg(dash.averageRating) : '—'}</div>
              <div className="ring-cap">out of 5</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="flex" style={{ alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <StoreIcon size={20} />
              <h2 style={{ fontSize: 19 }}>{dash.store.name}</h2>
            </div>
            <div className="muted flex" style={{ gap: 6, alignItems: 'flex-start', marginBottom: 14 }}>
              <MapPinIcon size={15} />
              <span>{dash.store.address}</span>
            </div>
            <div className="flex" style={{ gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{dash.totalRatings}</div>
                <div className="muted" style={{ fontSize: 13 }}>Total ratings</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>
                  {dash.averageRating != null ? (
                    <>
                      {formatAvg(dash.averageRating)} <span className="muted" style={{ fontSize: 15, fontWeight: 500 }}>/ 5</span>
                    </>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="muted" style={{ fontSize: 13 }}>Average rating</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 8 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dash.ratingBreakdown[star] || 0;
            return (
              <div className="rate-bar" key={star}>
                <span className="rb-label" style={{ minWidth: 34 }}>
                  {star} ★
                </span>
                <div className="rb-track">
                  <div className="rb-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="rb-label" style={{ minWidth: 24, textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="page-head" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: 18 }}>Users who rated your store</h2>
          <p className="page-sub">Sortable list of everyone who submitted a rating.</p>
        </div>
        {dash.totalRatings === 0 && <Badge label="No ratings yet" variant="muted" />}
      </div>

      <DataTable
        columns={columns}
        rows={ratings?.items}
        loading={loading}
        error={error}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onRetry={loadRatings}
        emptyTitle="No ratings yet"
        emptyMessage="When customers rate your store, they will appear here."
      />

      {ratings && ratings.total > 0 && (
        <div className="card mt-2" style={{ padding: 0 }}>
          <Pagination page={ratings.page} totalPages={ratings.totalPages} total={ratings.total} limit={ratings.limit} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}