import { useState, useRef, useEffect, createContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { roleLabel, initials } from '../utils/format';
import { GridIcon, StoreIcon, UsersIcon, StarRatingIcon, LockIcon, LogoutIcon, UserIcon, MenuIcon, SettingsIcon, NotificationsIcon, SearchIcon, ThemeIcon } from '../components/Icons';
import { homeFor } from '../pages/HomeLink';

const SidebarContext = createContext({ search: '', setSearch: () => {} });

const SIDEBAR_WIDTH = '260px';

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
          className={`sidebar fixed left-0 top-0 h-screen w-[260px] flex flex-col p-space-md border-r border-outline-variant z-30 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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

        {/* Mobile drawer overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm z-20 cursor-pointer md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main area */}
        <div className="main-area flex-1 md:ml-[260px] p-margin-page overflow-y-auto pt-16">
          <header className="topbar fixed top-0 right-0 left-0 md:left-[260px] h-16 z-10 bg-surface-bright/85 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-gutter w-full">
            {/* Mobile menu button */}
            <button
              type="button"
              className="flex items-center gap-2 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={20} />
            </button>

            {/* Desktop search (user only) */}
            {searchVisible && (
              <div className="relative flex-1 md:max-w-lg max-w-full mx-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  className="w-full h-10 pl-10 pr-12 rounded-full bg-surface-container border border-outline-variant focus:bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors"
                  placeholder="Search stores by name or address..."
                  value={query}
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

              {/* Theme toggle */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-70"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  aria-label="Toggle theme"
                >
                  <ThemeIcon size={20} />
                </button>
                {themeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-container-low transition-colors flex items-center gap-2 ${theme === 'light' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'}`}
                      onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                    >
                      <span className="material-symbols-outlined text-[16px]">light_mode</span>
                      Light
                    </button>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-container-low transition-colors flex items-center gap-2 ${theme === 'dark' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'}`}
                      onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                    >
                      <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                      Dark
                    </button>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-70"
                onClick={() => navigate(getChangePasswordPath(user?.role))}
                aria-label="Settings"
              >
                <SettingsIcon size={20} />
              </button>

              <div className="w-px h-6 bg-outline-variant" />

              {/* Avatar with logout */}
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
