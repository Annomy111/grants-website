import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserPlusIcon, PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';

const AdminUsers = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalType === 'add') {
        await axios.post('/api/users', formData);
      } else if (modalType === 'edit') {
        await axios.put(`/api/users/${selectedUser.id}`, {
          username: formData.username,
          email: formData.email,
          role: formData.role
        });
      } else if (modalType === 'password') {
        await axios.put(`/api/users/${selectedUser.id}/password`, {
          password: formData.password
        });
      }
      
      fetchUsers();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    
    if (type === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'admin'
      });
    }
    
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          User Management
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage admin accounts and permissions
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <table className="min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}">
          <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Username
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Email
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Role
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Created
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {users.map((user) => (
              <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex items-center">
                    {user.username}
                    {user.id === currentUser.id && (
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user.email}
                </td>
                <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openModal('edit', user)}
                    className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    title="Edit User"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => openModal('password', user)}
                    className={`${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}
                    title="Change Password"
                  >
                    <KeyIcon className="h-5 w-5 inline" />
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                      title="Delete User"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            
            <div className={`relative rounded-lg max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {modalType === 'add' && 'Add New User'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'password' && 'Change Password'}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {(modalType === 'add' || modalType === 'edit') && (
                  <>
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        className={`w-full px-3 py-2 rounded-md border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={`w-full px-3 py-2 rounded-md border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-3 py-2 rounded-md border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>
                  </>
                )}

                {(modalType === 'add' || modalType === 'password') && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {modalType === 'password' ? 'New Password' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {modalType === 'add' && 'Add User'}
                    {modalType === 'edit' && 'Update User'}
                    {modalType === 'password' && 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;