import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../services/adminApi';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorBox from '../../components/ErrorBox';
import { GridIcon, UsersIcon, StarRatingIcon, StoreIcon } from '../../components/Icons';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setStats(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <Loading label="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return <ErrorBox message={error} />;
  }

  const totalRatings = stats.ratingBreakdown
    ? Object.values(stats.ratingBreakdown).reduce((a, b) => a + b, 0)
    : stats.totalRatings;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-sub">A high-level overview of the platform.</p>
        </div>
        <div className="flex" style={{ gap: 10 }}>
          <Link to="/admin/stores/new" className="btn btn-primary">
            <StoreIcon size={16} /> Add store
          </Link>
          <Link to="/admin/users/new" className="btn btn-soft">
            <UsersIcon size={16} /> Add user
          </Link>
        </div>
      </div>

      <div className="grid-cards">
        <StatCard label="Total users" value={stats.totalUsers} tone="var(--brand)" icon={<UsersIcon size={22} />} />
        <StatCard label="Total stores" value={stats.totalStores} tone="var(--info)" icon={<StoreIcon size={22} />} />
        <StatCard label="Total ratings" value={totalRatings} tone="var(--warn)" icon={<StarRatingIcon size={22} />} />
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="card card-pad">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Users by role</h3>
          {stats.roleBreakdown && (
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { key: 'SYSTEM_ADMIN', label: 'System Admins' },
                { key: 'STORE_OWNER', label: 'Store Owners' },
                { key: 'NORMAL_USER', label: 'Normal Users' },
              ].map((row) => (
                <div className="rate-bar" key={row.key}>
                  <span className="rb-label" style={{ minWidth: 110 }}>
                    {row.label}
                  </span>
                  <div className="rb-track">
                    <div
                      className="rb-fill"
                      style={{ width: `${stats.totalUsers ? (stats.roleBreakdown[row.key] / stats.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="rb-label" style={{ textAlign: 'right', fontWeight: 700 }}>
                    {stats.roleBreakdown[row.key]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Rating distribution</h3>
          {stats.ratingBreakdown && (
            <div style={{ display: 'grid', gap: 10 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingBreakdown[star] || 0;
                const pct = totalRatings ? (count / totalRatings) * 100 : 0;
                return (
                  <div className="rate-bar" key={star}>
                    <span className="rb-label" style={{ minWidth: 34 }}>
                      {star} ★
                    </span>
                    <div className="rb-track">
                      <div className="rb-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rb-label" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}