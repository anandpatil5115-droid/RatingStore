import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers } from '../../services/userApi';
import { roleLabel, roleBadgeClass, formatDate } from '../../utils/format';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import UserDetailsModal from './UserDetailsModal';

const PAGE_SIZE = 10;
const ROLE_FILTERS = [
  { value: '', label: 'All roles' },
  { value: 'NORMAL_USER', label: 'Normal Users' },
  { value: 'STORE_OWNER', label: 'Store Owners' },
  { value: 'SYSTEM_ADMIN', label: 'System Admins' },
];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: role || undefined,
        sortBy,
        order,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, role, sortBy, order]);

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
    { key: 'name', header: 'Name', sortable: true, render: (r) => <span className="td-primary">{r.name}</span> },
    { key: 'email', header: 'Email', sortable: true, render: (r) => <span className="td-muted">{r.email}</span> },
    { key: 'address', header: 'Address', sortable: true, render: (r) => <span style={{ maxWidth: 240, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{r.address || '—'}</span> },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (r) => <Badge label={roleLabel(r.role)} variant={roleBadgeClass(r.role)} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (r) => <span className="td-muted">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(r.id)}>
            View details
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">User management</h1>
          <p className="page-sub">View normal users, store owners and administrators.</p>
        </div>
        <Link to="/admin/users/new" className="btn btn-primary">
          + Add user
        </Link>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={(term) => { setPage(1); setSearch(term); }} placeholder="Search by name, email or address…" />
        <select
          className="select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
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
        emptyTitle="No users found"
        emptyMessage={search || role ? 'Try different search filters.' : 'Create users from the Add User page.'}
      />

      {data && data.total > 0 && (
        <div className="card mt-2" style={{ padding: 0 }}>
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
        </div>
      )}

      {selectedUser && <UserDetailsModal userId={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}