import { useState, useEffect, useContext, createContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { roleLabel, initials } from '../utils/format';
import { GridIcon, StoreIcon, UsersIcon, StarRatingIcon, LockIcon, LogoutIcon, UserIcon, MenuIcon, SettingsIcon, NotificationsIcon } from '../components/Icons';

const SIDEBAR_WIDTH = '260px';

const SidebarContext = createContext({ search: '', setSearch: () => {} });

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search state (debounced)
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pageTitle = (() => {
    if (!user) return 'Store Explorer';
    if (user.role === 'SYSTEM_ADMIN') return 'Administration';
    if (user.role === 'STORE_OWNER') return 'Store Owner';
    return 'Store Explorer';
  })();

  // Nav items per role
  const nav = (() => {
    if (!user) return [];
    if (user.role === 'SYSTEM_ADMIN') {
      return [
        { to: '/admin', icon: <GridIcon />, label: 'Dashboard' },
        { to: '/admin/stores', icon: <StoreIcon />, label: 'Stores' },
        { to: '/admin/users', icon: <UsersIcon />, label: 'Users' },
        { to: '/admin/stores/new', icon: <StoreIcon />, label: 'Add Store' },
        { to: '/admin/users/new', icon: <UserIcon />, label: 'Add User' },
        { to: '/admin/change-password', icon: <LockIcon />, label: 'Change Password' },
      ];
    }
    if (user.role === 'STORE_OWNER') {
      return [
        { to: '/owner', icon: <StarRatingIcon />, label: 'Dashboard' },
        { to: '/owner/change-password', icon: <LockIcon />, label: 'Change Password' },
      ];
    }
    return [
      { to: '/app', icon: <StoreIcon />, label: 'Browse Stores' },
      { to: '/app/change-password', icon: <LockIcon />, label: 'Change Password' },
    ];
  })();

  // Search: render only for normal user
  const searchVisible = user?.role === 'NORMAL_USER';

  const searchChange = (e) => {
    setQuery(e.target.value);
  };

  // Outlet context: pass search and setter
  const searchContextValue = {
    search: debouncedQuery,
    setSearch: setQuery,
  };

  return (
    <SidebarContext.Provider value={searchContextValue}>
      <div className="flex min-h-screen w-full bg-background text-on-background">
        {/* Sidebar */}
        <aside
          className={`sidebar fixed left-0 top-0 h-screen w-[sidebar-width] flex flex-col p-space-md border-r border-outline-variant hidden md:flex z-20`}
        >
          <div className="mb-space-xl px-2">
            <h1 className="font-headline-md text-headline-md text-on-primary font-bold">Store Explorer</h1>
            <p className="font-body-md text-body-md text-on-primary/70">Discover & Rate</p>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">Menu</div>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={e => {
                  closeSidebar();
                  navigate(item.to, { replace: true });
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">{initials(user?.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="chip-name">{user?.name}</div>
                <div className="chip-role">{roleLabel(user?.role)}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile drawer overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm z-10 cursor-pointer"
            onClick={closeSidebar}
          />
        )}

        {/* Main area */}
        <div className="main-area flex-1 md:ml-[sidebar-width] p-margin-page overflow-y-auto mt-20 pt-space-md">
          <header className="topbar fixed top-0 right-0 left-0 md:left-[sidebar-width] h-16 z-10 bg-surface-bright/85 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-gutter w-full">
            {/* Mobile menu button */}
            <button
              type="button"
              className="menu-btn flex items-center gap-2 hidden md:inline-flex"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={20} />
              <span className="font-caption text-caption">Menu</span>
            </button>

            {/* Desktop search (user only) */}
            {searchVisible && (
              <div className="relative flex-1 md:max-w-lg max-w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  className="w-full h-10 pl-10 pr-12 rounded-full bg-surface-container border border-outline-variant focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors"
                  placeholder="Search stores by name or address..."
                  value={debouncedQuery}
                  onChange={searchChange}
                  aria-label="Search stores"
                />
              </div>
            )}

            {/* Topbar actions */}
            <div className="flex items-center gap-space-md">
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-70"
                aria-label="Notifications"
              >
                <NotificationsIcon size={20} />
              </button>
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-70"
                onClick={() => navigate('/app/change-password')}
                aria-label="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              <div className="w-px h-6 bg-outline-variant" />
              <button
                type="button"
                className="flex items-center gap-space-sm cursor-pointer"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-md text-label-md flex-shrink-0">
                  {initials(user?.name)}
                </div>
                <span className="font-label-md text-label-md text-on-surface hidden lg:block">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
            </div>
          </header>

          <main className="content-wrap">
            <Outlet context={searchContextValue} />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}