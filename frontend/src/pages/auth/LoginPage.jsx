import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail } from '../../utils/validators';
import PasswordInput from '../../components/PasswordInput';

const ROLE_HOME = { SYSTEM_ADMIN: '/admin', STORE_OWNER: '/owner', NORMAL_USER: '/app' };

const FEATURES = [
  { icon: 'analytics', title: 'Discover top-rated stores', body: 'Browse ratings and find the best places near you.' },
  { icon: 'security', title: 'Secure & trusted ratings', body: 'Verified users sharing honest feedback.' },
  { icon: 'hub', title: 'Stores in one place', body: 'A single hub for every kind of store.' },
];

const IS_DEV = import.meta.env.DEV;

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
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
    const e = validateEmail(form.email);
    if (e) next.email = e;
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(ROLE_HOME[user.role] || '/app', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-surface-container-lowest py-3 pl-10 pr-3 text-[14px] leading-[20px] text-on-surface outline-none transition placeholder:text-on-surface-variant/60 ${
      hasError ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-background text-on-background">
      {/* Left brand panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-on-primary lg:flex">
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">S</div>
          <span className="text-[18px] font-semibold">Store Rating</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-on-primary">Sign in to rate and manage stores</h1>
          <p className="mt-3 text-[15px] leading-6 text-on-primary/80">
            Store Rating connects shoppers with real, verified feedback — and gives store owners the tools to improve.
          </p>

          <ul className="mt-10 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined mt-0.5 text-on-primary/80 text-[18px]">{f.icon}</span>
                <div>
                  <div className="text-[13px] font-medium leading-4 text-on-primary">{f.title}</div>
                  <div className="mt-0.5 text-[13px] leading-5 text-on-primary/70">{f.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[13px] text-on-primary/50">© 2026 Store Rating</div>
      </aside>

      {/* Right form panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-10 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-[18px] font-semibold text-on-surface">Store Rating</span>
          </div>

          {/* Header */}
          <div className="mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Welcome back</span>
          </div>
          <h2 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-on-surface">Sign in to your account</h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">Log in to access your dashboard.</p>

          {/* Server error */}
          {serverError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-outline-variant bg-error-container px-3 py-2.5 text-[14px] text-on-error-container">
              <span className="material-symbols-outlined mt-0.5 text-[16px]">error</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="email">
                Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="email"
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

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface" htmlFor="password">
                Password <span className="text-error">*</span>
              </label>
              <PasswordInput
                id="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Enter your password"
                autoComplete="current-password"
                hasError={!!errors.password}
              />
              {errors.password && <p className="mt-1.5 text-[12px] text-error">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-on-primary transition hover:bg-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary transition hover:underline">
              Create account
            </Link>
          </p>

          {/* Dev-only demo credentials */}
          {IS_DEV && (
            <div className="mt-6 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                Test / Demo environment only
              </div>
              <p>
                Password for all accounts: <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-[12px]">Welcome@123</code>
              </p>
              <ul className="mt-1.5 space-y-0.5">
                <li>Admin: <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-[12px]">admin@storehub.io</code></li>
                <li>Owner: <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-[12px]">meera.rk@example.com</code></li>
                <li>User: <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-[12px]">ananya.rao@example.com</code></li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
