import React, { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  HomeIcon,
  DocumentTextIcon,
  NewspaperIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Grants', href: '/admin/grants', icon: DocumentTextIcon },
    { name: 'Blog Posts', href: '/admin/blog', icon: NewspaperIcon },
    // Removed: Blog Generation - requires Express server (not deployed)
    // Removed: Users - requires Express server (not deployed)
    { name: 'Profile', href: '/admin/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = href => {
    return (
      location.pathname === href ||
      (href !== '/admin/dashboard' && location.pathname.startsWith(href))
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${sidebarOpen ? '' : 'hidden'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Admin Panel
              </h2>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? darkMode
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href)
                        ? darkMode
                          ? 'text-gray-300'
                          : 'text-gray-500'
                        : darkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {user?.username}
                </p>
                <button
                  onClick={handleLogout}
                  className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-400'}`}
                >
                  <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div
          className={`flex-1 flex flex-col min-h-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Admin Panel
              </h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? darkMode
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href)
                        ? darkMode
                          ? 'text-gray-300'
                          : 'text-gray-500'
                        : darkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div
            className={`flex-shrink-0 flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}
          >
            <div className="flex items-center w-full">
              <div>
                <div
                  className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}
                >
                  <span
                    className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {user?.username}
                </p>
                <button
                  onClick={handleLogout}
                  className={`flex items-center text-xs font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-400'}`}
                >
                  <ArrowLeftOnRectangleIcon className="mr-1 h-3 w-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div
          className={`sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
        >
          <button
            type="button"
            className={`-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
