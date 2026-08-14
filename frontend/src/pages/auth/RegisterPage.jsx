import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerApi } from '../../services/authApi';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validators';
import PasswordInput from '../../components/PasswordInput';

const FEATURES = [
  { icon: 'analytics', title: 'Discover top-rated stores', body: 'Browse ratings and find the best places near you.' },
  { icon: 'security', title: 'Secure & trusted ratings', body: 'Verified users sharing honest feedback.' },
  { icon: 'hub', title: 'Stores in one place', body: 'A single hub for every kind of store.' },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    const checks = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    Object.entries(checks).forEach(([key, msg]) => {
      if (msg) next[key] = msg;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await registerApi({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      const user = await login(form.email.trim().toLowerCase(), form.password);
      toast.success('Account created successfully. Welcome!');
      navigate('/app', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white py-3 pl-10 pr-3 text-[14px] leading-[20px] text-on-surface outline-none transition placeholder:text-on-surface-variant/60 ${
      hasError ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-surface text-on-surface">
      {/* Left brand panel — identical to Login */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-on-primary lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(closest-side, #ffffff, transparent)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full opacity-20"
          style={{ background: 'radial-gradient(closest-side, #b4c5ff, transparent)' }}
        />

        <div className="relative flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px]">verified</span>
          <span className="text-[20px] font-semibold tracking-tight">Store Rating</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-[36px] font-bold leading-tight tracking-tight text-on-primary">Join the store rating community</h1>
          <p className="mt-4 text-[16px] leading-6 text-on-primary/90">
            Create your account to start rating stores, leave honest feedback, and discover the best places to shop.
          </p>

          <ul className="mt-12 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 text-on-primary/90">{f.icon}</span>
                <div>
                  <div className="text-[12px] font-medium leading-4 text-on-primary">{f.title}</div>
                  <div className="mt-0.5 text-[14px] leading-5 text-on-primary/80">{f.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[14px] text-on-primary/60">© 2026 Store Rating</div>
      </aside>

      {/* Right form panel — mirrors Login exactly */}
      <main className="flex flex-1 flex-col items-center justify-center bg-surface px-4 py-10 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="material-symbols-outlined text-[32px] text-primary">verified</span>
            <span className="text-[20px] font-semibold text-on-surface">Store Rating</span>
          </div>

          {/* Header — same pattern as Login */}
          <div className="mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person_add</span>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Create account</span>
          </div>
          <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-on-surface">Create your account</h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">Start rating stores in minutes.</p>

          {/* Server error */}
          {serverError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-outline-variant bg-error-container px-3 py-2.5 text-[14px] text-on-error-container">
              <span className="material-symbols-outlined mt-0.5 text-[16px]">error</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* Full name */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="reg-name">
                Full name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </span>
                <input
                  id="reg-name"
                  type="text"
                  className={inputClass(!!errors.name)}
                  placeholder="e.g. Ananya Ramanathan Rao"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-[12px] text-error">{errors.name}</p>}
              {!errors.name && <p className="mt-1 text-[12px] text-on-surface-variant">Between 20 and 60 characters.</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="reg-email">
                Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="reg-email"
                  type="email"
                  className={inputClass(!!errors.email)}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-[12px] text-error">{errors.email}</p>}
            </div>

            {/* Address (optional) */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="reg-address">
                Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </span>
                <input
                  id="reg-address"
                  type="text"
                  className={inputClass(!!errors.address)}
                  placeholder="Street, city, pincode"
                  value={form.address}
                  onChange={set('address')}
                  autoComplete="street-address"
                />
              </div>
              {errors.address && <p className="mt-1.5 text-[12px] text-error">{errors.address}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="reg-password">
                Password <span className="text-error">*</span>
              </label>
              <PasswordInput
                id="reg-password"
                value={form.password}
                onChange={set('password')}
                placeholder="Enter a strong password"
                autoComplete="new-password"
                hasError={!!errors.password}
              />
              {errors.password && <p className="mt-1.5 text-[12px] text-error">{errors.password}</p>}
              {!errors.password && (
                <p className="mt-1 text-[12px] text-on-surface-variant">
                  8–16 characters, at least one uppercase and one special character.
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="reg-confirm">
                Confirm password <span className="text-error">*</span>
              </label>
              <PasswordInput
                id="reg-confirm"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repeat the password"
                autoComplete="new-password"
                hasError={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-[12px] text-error">{errors.confirmPassword}</p>}
            </div>

            {/* Submit — same style as Login */}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-on-primary transition hover:bg-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary transition hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
