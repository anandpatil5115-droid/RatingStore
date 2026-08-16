import { useState, useRef, useEffect, createContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { roleLabel, initials } from '../utils/format';
import { GridIcon, StoreIcon, UsersIcon, StarRatingIcon, LockIcon, UserIcon, MenuIcon, SettingsIcon, NotificationsIcon, ThemeIcon } from '../components/Icons';

const SidebarContext = createContext({ search: '', setSearch: () => {} });

function getChangePasswordPath(role) {
  if (role === 'SYSTEM_ADMIN') return '/admin/change-password';
  if (role === 'STORE_OWNER') return '/owner/change-password';
  return '/app/change-password';
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const themeDropdownRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const searchVisible = user?.role === 'NORMAL_USER';

  const searchChange = (e) => setQuery(e.target.value);

  const searchContextValue = { search: debouncedQuery, setSearch: setQuery };

  return (
    <SidebarContext.Provider value={searchContextValue}>
      <div className="flex min-h-screen w-full bg-background text-on-background">
        {/* Sidebar */}
        <aside
          className={`sidebar fixed left-0 top-0 h-screen flex flex-col z-30 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="sidebar-brand">
            <div className="logo-mark">S</div>
            <div className="logo-text">Store Explorer</div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">Menu</div>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
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

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main content */}
        <div className="main-area flex-1 md:ml-[240px] pt-[56px]">
          {/* Topbar */}
          <header className="topbar fixed top-0 right-0 left-0 md:left-[240px] z-10">
            {/* Mobile menu */}
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-container transition-colors md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={18} />
            </button>

            {/* Search */}
            {searchVisible && (
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  className="w-full h-8 pl-9 pr-3 rounded-md bg-surface-container border border-outline-variant text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
                  placeholder="Search stores..."
                  value={debouncedQuery}
                  onChange={searchChange}
                  aria-label="Search stores"
                />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Notifications"
              >
                <NotificationsIcon size={17} />
              </button>

              {/* Theme */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  aria-label="Toggle theme"
                >
                  <ThemeIcon size={17} />
                </button>
                {themeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 min-w-[120px] py-1">
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-surface-container transition-colors flex items-center gap-2 ${theme === 'light' ? 'text-primary font-medium' : 'text-on-surface'}`}
                      onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                    >
                      <span className="material-symbols-outlined text-[15px]">light_mode</span>
                      Light
                    </button>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-surface-container transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-primary font-medium' : 'text-on-surface'}`}
                      onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                    >
                      <span className="material-symbols-outlined text-[15px]">dark_mode</span>
                      Dark
                    </button>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                onClick={() => navigate(getChangePasswordPath(user?.role))}
                aria-label="Settings"
              >
                <SettingsIcon size={17} />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-outline-variant mx-1" />

              {/* User */}
              <button
                type="button"
                className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-surface-container transition-colors"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-[11px] font-medium flex-shrink-0">
                  {initials(user?.name)}
                </div>
                <span className="text-[12.5px] font-medium text-on-surface hidden lg:block">
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
