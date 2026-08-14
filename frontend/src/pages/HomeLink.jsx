import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function homeFor(role) {
  return { SYSTEM_ADMIN: '/admin', STORE_OWNER: '/owner', NORMAL_USER: '/app' }[role] || '/';
}

export default function HomeLink() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(homeFor(user.role))}>Go to my dashboard</button>;
}

export { homeFor };