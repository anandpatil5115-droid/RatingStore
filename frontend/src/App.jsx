import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';
import Loading from './components/Loading';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStores from './pages/admin/AdminStores';
import AdminUsers from './pages/admin/AdminUsers';
import AddStore from './pages/admin/AddStore';
import AddUser from './pages/admin/AddUser';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="auth-page">
        <Loading label="Checking your session…" size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleGuard({ allowed, children }) {
  const { user } = useAuth();
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function HomeRedirect() {
  const { user } = useAuth();
  const home = { SYSTEM_ADMIN: '/admin', STORE_OWNER: '/owner', NORMAL_USER: '/app' }[user.role] || '/login';
  return <Navigate to={home} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<RoleGuard allowed={['NORMAL_USER']} />}>
              <Route path="/app" element={<MainLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>

            <Route element={<RoleGuard allowed={['STORE_OWNER']} />}>
              <Route path="/owner" element={<MainLayout />}>
                <Route index element={<OwnerDashboard />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>

            <Route element={<RoleGuard allowed={['SYSTEM_ADMIN']} />}>
              <Route path="/admin" element={<MainLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="stores" element={<AdminStores />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="stores/new" element={<AddStore />} />
                <Route path="users/new" element={<AddUser />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}