import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listStores } from '../../services/storeApi';
import { formatAvg } from '../../utils/format';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';

const PAGE_SIZE = 10;

export default function AdminStores() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStores({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy,
        order,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

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
    { key: 'name', header: 'Store name', sortable: true, render: (r) => <span className="td-primary">{r.name}</span> },
    { key: 'email', header: 'Email', sortable: true, render: (r) => <span className="td-muted">{r.email}</span> },
    { key: 'address', header: 'Address', sortable: true, render: (r) => <span style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{r.address || '—'}</span> },
    {
      key: 'rating',
      header: 'Overall rating',
      sortable: true,
      render: (r) =>
        r.averageRating != null ? (
          <span>
            <strong>{formatAvg(r.averageRating)}</strong>
            <span className="muted"> / 5 ({r.ratingCount})</span>
          </span>
        ) : (
          <Badge label="No ratings" />
        ),
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Store management</h1>
          <p className="page-sub">Search, sort and paginate all registered stores.</p>
        </div>
        <Link to="/admin/stores/new" className="btn btn-primary">
          + Add store
        </Link>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={(term) => { setPage(1); setSearch(term); }} placeholder="Search by name, email or address…" />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items}
        loading={loading}
        error={error}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onRetry={load}
        emptyTitle="No stores found"
        emptyMessage={search ? 'Try a different search term.' : 'Create your first store from the Add Store page.'}
      />

      {data && data.total > 0 && (
        <div className="card mt-2" style={{ padding: 0 }}>
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}