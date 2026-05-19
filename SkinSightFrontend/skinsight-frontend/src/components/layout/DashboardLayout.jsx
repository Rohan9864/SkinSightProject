import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentIcon,
  DocumentArrowUpIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  FolderIcon,
  ArrowsUpDownIcon,
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const navConfig = {
  PATIENT: [
    { label: 'Dashboard', icon: HomeIcon, path: '/patient' },
    { label: 'My Cases', icon: ClipboardDocumentIcon, path: '/patient/cases' },
    { label: 'Submit Case', icon: DocumentArrowUpIcon, path: '/patient/submit' },
    { label: 'Notifications', icon: BellIcon, path: '/patient/notifications' },
    { label: 'Profile', icon: UserIcon, path: '/patient/profile' },
  ],
  DOCTOR: [
    { label: 'Dashboard', icon: HomeIcon, path: '/doctor' },
    { label: 'Assigned Cases', icon: ClipboardDocumentCheckIcon, path: '/doctor' },
    { label: 'Profile', icon: UserIcon, path: '/doctor/profile' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: HomeIcon, path: '/admin' },
    { label: 'All Cases', icon: FolderIcon, path: '/admin/cases' },
    { label: 'Assign Cases', icon: ArrowsUpDownIcon, path: '/admin/cases' },
    { label: 'Manage Users', icon: UsersIcon, path: '/admin/users' },
    { label: 'Audit Logs', icon: ShieldCheckIcon, path: '/admin/audit' },
  ],
};

export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [sidebarIconOnly, setSidebarIconOnly] = useState(false);

  // Get navigation items for current user role
  const navItems = navConfig[user?.role] || [];

  // Fetch notification count on mount and poll every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications/my/unread/count');
        setNotificationCount(response.data || 0);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
        setSidebarIconOnly(false);
      } else if (window.innerWidth >= 768) {
        setSidebarOpen(false);
        setSidebarIconOnly(true);
      } else {
        setSidebarIconOnly(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isNavActive = (path) => {
    // Handle dashboard routes
    if (path === '/patient' && location.pathname.startsWith('/patient') && location.pathname === '/patient') return true;
    if (path === '/doctor' && location.pathname.startsWith('/doctor') && location.pathname === '/doctor') return true;
    if (path === '/admin' && location.pathname.startsWith('/admin') && location.pathname === '/admin') return true;
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* SIDEBAR - DESKTOP */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#1a2332] text-slate-400 transition-all duration-300 z-40 ${
          sidebarIconOnly ? 'w-16' : 'w-60'
        } hidden md:flex flex-col lg:w-60`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 px-4 py-6 border-b border-slate-700">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-lg flex-shrink-0">
            <span className="text-white font-bold text-sm">SS</span>
          </div>
          {!sidebarIconOnly && (
            <span className="font-bold text-white text-sm">SkinSight</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                title={sidebarIconOnly ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-sky-500/20 text-sky-400 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarIconOnly && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700 px-3 py-4 space-y-3">
          {!sidebarIconOnly && (
            <div className="px-2 py-2 bg-slate-700/50 rounded-lg">
              <p className="text-xs font-semibold text-slate-300 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-sky-500/20 text-sky-300 rounded">
                {user?.role}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={sidebarIconOnly ? 'Logout' : ''}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarIconOnly && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* SIDEBAR - MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - MOBILE */}
      <div
        className={`fixed left-0 top-0 h-full w-60 bg-[#1a2332] text-slate-400 z-40 md:hidden transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-lg">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-white text-sm">SkinSight</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-slate-700/50 rounded"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-sky-500/20 text-sky-400 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700 px-3 py-4 space-y-3">
          <div className="px-2 py-2 bg-slate-700/50 rounded-lg">
            <p className="text-xs font-semibold text-slate-300 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-sky-500/20 text-sky-300 rounded">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarIconOnly ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            {/* Left: Title + Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Bars3Icon className="w-6 h-6 text-slate-700" />
              </button>
              <h1 className="text-2xl font-bold text-slate-800 hidden sm:block">{title}</h1>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button
                onClick={() => navigate(`/${user?.role.toLowerCase()}/notifications`)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <BellIcon className="w-6 h-6 text-slate-700" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* User Avatar + Name (hidden on mobile) */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto bg-slate-100">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
