export default function Field({ label, required, error, hint, className, children }) {
  return (
    <div className={`field ${className || ''}`}>
      {label && (
        <label>
          {label}
          {required && <span className="req"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}