import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { UserIcon, KeyIcon } from '@heroicons/react/24/outline';

const AdminProfile = () => {
  const { user, changePassword } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
        Profile Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center mb-4">
            <UserIcon className={`h-6 w-6 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              User Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Username
              </label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.username}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Email
              </label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.email}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Role
              </label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.role}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Member Since
              </label>
              <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center mb-4">
            <KeyIcon className={`h-6 w-6 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Change Password
            </h2>
          </div>

          {message.text && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;