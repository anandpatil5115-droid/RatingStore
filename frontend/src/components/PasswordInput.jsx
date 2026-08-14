import { useState } from 'react';

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
  hasError = false,
}) {
  const [visible, setVisible] = useState(false);

  const inputClass = `w-full rounded-lg border bg-surface-container-lowest py-3 pl-10 pr-10 text-[14px] leading-[20px] text-on-surface outline-none transition placeholder:text-on-surface-variant/60 ${
    hasError
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
  }`;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[20px]">lock</span>
      </span>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <span className="material-symbols-outlined text-[20px]">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
}
