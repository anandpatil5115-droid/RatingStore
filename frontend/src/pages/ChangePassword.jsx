import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { changePasswordApi } from '../services/authApi';
import { validatePassword, validateConfirmPassword } from '../utils/validators';
import { useNavigate } from 'react-router-dom';
import { homeFor } from './HomeLink';
import PasswordInput from '../components/PasswordInput';

export default function ChangePassword() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Current password is required.';
    const np = validatePassword(form.newPassword);
    if (np) next.newPassword = np;
    const cp = validateConfirmPassword(form.newPassword, form.confirmNewPassword);
    if (cp) next.confirmNewPassword = cp;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await changePasswordApi({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      toast.success('Password updated successfully.');
      navigate(homeFor(user.role), { replace: true });
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
          <h1 className="page-title">Change password</h1>
          <p className="page-sub">Update your account password.</p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-outline-variant bg-error-container px-3 py-2.5 text-[14px] text-on-error-container">
          <span className="material-symbols-outlined mt-0.5 text-[16px]">error</span>
          <span>{serverError}</span>
        </div>
      )}

      <div className="card card-pad" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">
              Current password <span className="text-error">*</span>
            </label>
            <PasswordInput
              value={form.currentPassword}
              onChange={set('currentPassword')}
              placeholder="Enter current password"
              autoComplete="current-password"
              hasError={!!errors.currentPassword}
            />
            {errors.currentPassword && <p className="mt-1.5 text-[12px] text-error">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">
              New password <span className="text-error">*</span>
            </label>
            <PasswordInput
              value={form.newPassword}
              onChange={set('newPassword')}
              placeholder="Enter new password"
              autoComplete="new-password"
              hasError={!!errors.newPassword}
            />
            {errors.newPassword && <p className="mt-1.5 text-[12px] text-error">{errors.newPassword}</p>}
            {!errors.newPassword && (
              <p className="mt-1 text-[12px] text-on-surface-variant">
                8–16 characters, at least one uppercase and one special character.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-on-surface">
              Confirm new password <span className="text-error">*</span>
            </label>
            <PasswordInput
              value={form.confirmNewPassword}
              onChange={set('confirmNewPassword')}
              placeholder="Repeat the new password"
              autoComplete="new-password"
              hasError={!!errors.confirmNewPassword}
            />
            {errors.confirmNewPassword && <p className="mt-1.5 text-[12px] text-error">{errors.confirmNewPassword}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-on-primary transition hover:bg-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </button>
            <button
              type="button"
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-on-surface transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => navigate(homeFor(user.role))}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
