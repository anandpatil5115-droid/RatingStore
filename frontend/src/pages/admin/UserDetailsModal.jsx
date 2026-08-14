import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import StarRating from '../../components/StarRating';
import { getUser } from '../../services/userApi';
import { roleLabel, roleBadgeClass, formatDateTime, formatAvg } from '../../utils/format';

export default function UserDetailsModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return undefined;
    setData(null);
    setError('');
    getUser(userId)
      .then((res) => setData(res.user))
      .catch((err) => setError(err.message));
    return undefined;
  }, [userId]);

  const user = data || {};

  return (
    <Modal open onClose={onClose} title="User details">
      {error ? (
        <p className="text-danger">{error}</p>
      ) : !data ? (
        <Loading label="Loading user…" />
      ) : (
        <div>
          <div className="detail-list">
            <div className="detail-item">
              <span className="di-label">Name</span>
              <span className="di-value">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="di-label">Email</span>
              <span className="di-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="di-label">Address</span>
              <span className="di-value">{user.address || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="di-label">Role</span>
              <span>
                <Badge label={roleLabel(user.role)} variant={roleBadgeClass(user.role)} />
              </span>
            </div>
            <div className="detail-item">
              <span className="di-label">Member since</span>
              <span className="di-value">{formatDateTime(user.createdAt)}</span>
            </div>
          </div>

          {user.role === 'STORE_OWNER' && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
              <h4 style={{ marginBottom: 12, fontSize: 15 }}>Owned store</h4>
              {user.stores && user.stores.length > 0 ? (
                user.stores.map((store) => (
                  <div className="card" style={{ padding: 14, marginBottom: 10 }} key={store.id}>
                    <div className="flex-between">
                      <div>
                        <div style={{ fontWeight: 700 }}>{store.name}</div>
                        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                          {store.address || '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {store.averageRating != null ? (
                          <>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{formatAvg(store.averageRating)}<span className="muted" style={{ fontSize: 13 }}>/5</span></div>
                            <StarRating value={store.averageRating} readOnly sizeClass="stars-sm" />
                            <div className="muted" style={{ fontSize: 12 }}>
                              {store.ratingCount} rating{store.ratingCount === 1 ? '' : 's'}
                            </div>
                          </>
                        ) : (
                          <Badge label="No ratings" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">This store owner does not own any store yet.</p>
              )}
            </div>
          )}

          {user.role === 'NORMAL_USER' && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
              <h4 style={{ marginBottom: 4, fontSize: 15 }}>Ratings submitted</h4>
              <span className="muted" style={{ fontSize: 13 }}>
                {user.ratings ? user.ratings.length : 0} rating{user.ratings && user.ratings.length === 1 ? '' : 's'} across stores.
              </span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}