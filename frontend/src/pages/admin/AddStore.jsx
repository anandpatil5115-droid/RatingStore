import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStore } from '../../services/storeApi';
import { listUsers } from '../../services/userApi';
import { useToast } from '../../context/ToastContext';
import Field from '../../components/Field';
import ErrorBox from '../../components/ErrorBox';
import Loading from '../../components/Loading';
import { validateStoreName, validateEmail, validateAddress } from '../../utils/validators';

export default function AddStore() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUsers({ role: 'STORE_OWNER', limit: 100 })
      .then((res) => setOwners(res.items))
      .catch(() => toast.error('Could not load store owners.'))
      .finally(() => setOwnersLoading(false));
  }, [toast]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    const n = validateStoreName(form.name);
    if (n) next.name = n;
    const e = validateEmail(form.email);
    if (e) next.email = e;
    const a = validateAddress(form.address);
    if (a) next.address = a;
    if (!form.ownerId) next.ownerId = 'Please select a store owner.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await createStore({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        ownerId: Number(form.ownerId),
      });
      toast.success('Store created successfully.');
      navigate('/admin/stores');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add store</h1>
          <p className="page-sub">Register a new store and assign it to a store owner.</p>
        </div>
        <Link to="/admin/stores" className="btn btn-ghost">
          Back to stores
        </Link>
      </div>

      {serverError && <ErrorBox message={serverError} />}

      <div className="card card-pad" style={{ maxWidth: 640 }}>
        {ownersLoading ? (
          <Loading label="Loading store owners…" />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="form-grid">
            <Field className="span-2" label="Store name" required error={errors.name}>
              <input
                type="text"
                className={`input ${errors.name ? 'err' : ''}`}
                placeholder="e.g. TechNova Electronics Hub"
                value={form.name}
                onChange={set('name')}
              />
            </Field>
            <Field label="Store email" required error={errors.email}>
              <input
                type="email"
                className={`input ${errors.email ? 'err' : ''}`}
                placeholder="store@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </Field>
            <Field label="Store owner" required error={errors.ownerId}>
              <select className={`select ${errors.ownerId ? 'err' : ''}`} value={form.ownerId} onChange={set('ownerId')}>
                <option value="">Select an owner…</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
              {owners.length === 0 && (
                <div className="field-hint">
                  No store owners yet — <Link to="/admin/users/new">create one first</Link>.
                </div>
              )}
            </Field>
            <Field className="span-2" label="Store address" required error={errors.address}>
              <input
                type="text"
                className={`input ${errors.address ? 'err' : ''}`}
                placeholder="Street, city, pincode"
                value={form.address}
                onChange={set('address')}
              />
            </Field>
            <div className="span-2 flex" style={{ gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={busy || owners.length === 0}>
                {busy ? 'Creating…' : 'Create store'}
              </button>
              <Link to="/admin/stores" className="btn btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}