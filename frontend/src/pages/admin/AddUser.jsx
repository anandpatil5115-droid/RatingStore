import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../../services/userApi';
import { useToast } from '../../context/ToastContext';
import Field from '../../components/Field';
import ErrorBox from '../../components/ErrorBox';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../utils/validators';

const ROLES = [
  { value: 'NORMAL_USER', label: 'Normal User' },
  { value: 'STORE_OWNER', label: 'Store Owner' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
];

export default function AddUser() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    const checks = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    Object.entries(checks).forEach(([key, msg]) => {
      if (msg) next[key] = msg;
    });
    if (!form.role) next.role = 'Please select a role.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
        role: form.role,
      });
      toast.success('User created successfully.');
      navigate('/admin/users');
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
          <h1 className="page-title">Add user</h1>
          <p className="page-sub">Create a normal user, store owner or administrator.</p>
        </div>
        <Link to="/admin/users" className="btn btn-ghost">
          Back to users
        </Link>
      </div>

      {serverError && <ErrorBox message={serverError} />}

      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} noValidate className="form-grid">
          <Field className="span-2" label="Full name" required error={errors.name} hint="Between 20 and 60 characters.">
            <input
              type="text"
              className={`input ${errors.name ? 'err' : ''}`}
              placeholder="e.g. Ananya Ramanathan Rao"
              value={form.name}
              onChange={set('name')}
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              className={`input ${errors.email ? 'err' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
            />
          </Field>
          <Field label="Role" required error={errors.role}>
            <select className={`select ${errors.role ? 'err' : ''}`} value={form.role} onChange={set('role')}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            className="span-2"
            label="Password"
            required
            error={errors.password}
            hint="8-16 characters with at least one uppercase letter and one special character."
          >
            <input
              type="password"
              className={`input ${errors.password ? 'err' : ''}`}
              placeholder="Enter a strong password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
            />
          </Field>
          <Field className="span-2" label="Address" error={errors.address}>
            <input
              type="text"
              className={`input ${errors.address ? 'err' : ''}`}
              placeholder="Street, city, pincode"
              value={form.address}
              onChange={set('address')}
            />
          </Field>
          <div className="span-2 flex" style={{ gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create user'}
            </button>
            <Link to="/admin/users" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}