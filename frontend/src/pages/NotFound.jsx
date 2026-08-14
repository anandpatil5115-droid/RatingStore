import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="es-icon" style={{ margin: '0 auto 16px' }}>
          <span style={{ fontSize: 40, fontWeight: 800 }}>404</span>
        </div>
        <h1 className="page-title">Page not found</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          The page you are looking for doesn&apos;t exist or was moved.
        </p>
        <div className="flex" style={{ justifyContent: 'center', gap: 10 }}>
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}