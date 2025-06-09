import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { fetchGrantsForAdmin } from '../utils/adminApiHelper';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import GrantEditModal from '../components/GrantEditModal';

const AdminGrants = () => {
  const { darkMode } = useContext(ThemeContext);
  const [grants, setGrants] = useState([]);
  const [filteredGrants, setFilteredGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrant, setEditingGrant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGrants();
  }, []);

  useEffect(() => {
    filterGrants();
  }, [searchTerm, grants]);

  const fetchGrants = async () => {
    try {
      const grantsData = await fetchGrantsForAdmin();
      setGrants(grantsData);
      setFilteredGrants(grantsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch grants:', error);
      setGrants([]);
      setFilteredGrants([]);
      setLoading(false);
    }
  };

  const filterGrants = () => {
    if (!searchTerm) {
      setFilteredGrants(grants);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = grants.filter(grant => {
      // Data is already normalized by fetchGrantsForAdmin
      const grantName = (grant.name || '').toLowerCase();
      const organization = (grant.organization || '').toLowerCase();
      const geoFocus = (grant.geographic_focus || '').toLowerCase();
      const focusAreas = (grant.focus_areas_en || '').toLowerCase();

      return (
        grantName.includes(term) ||
        organization.includes(term) ||
        geoFocus.includes(term) ||
        focusAreas.includes(term)
      );
    });
    setFilteredGrants(filtered);
  };

  const handleEdit = grant => {
    setEditingGrant(grant);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingGrant(null);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this grant?')) return;

    try {
      const token = localStorage.getItem('authToken'); // Fixed: was looking for 'token' instead of 'authToken'
      await axios.delete(`/.netlify/functions/grants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchGrants();
    } catch (error) {
      console.error('Failed to delete grant:', error);
      alert('Failed to delete grant');
    }
  };

  const handleSave = async () => {
    await fetchGrants();
    setShowModal(false);
    setEditingGrant(null);
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      'ID',
      'Grant Name',
      'Organization',
      'Geographic Focus',
      'Focus Areas (EN)',
      'Focus Areas (UK)',
      'Description (EN)',
      'Description (UK)',
      'Eligibility (EN)',
      'Eligibility (UK)',
      'Grant Type',
      'Grant Size Min',
      'Grant Size Max',
      'Deadline',
      'Website',
      'Application URL',
      'Contact Info',
      'Created At',
      'Updated At'
    ];

    // Convert grants data to CSV rows
    const csvRows = filteredGrants.map(grant => {
      return [
        grant.id || '',
        grant.name || '',
        grant.organization || '',
        grant.geographic_focus || '',
        grant.focus_areas_en || '',
        grant.focus_areas_uk || '',
        (grant.description_en || '').replace(/"/g, '""'), // Escape quotes
        (grant.description_uk || '').replace(/"/g, '""'),
        (grant.eligibility_en || '').replace(/"/g, '""'),
        (grant.eligibility_uk || '').replace(/"/g, '""'),
        grant.type || '',
        grant.grant_size_min || '',
        grant.grant_size_max || '',
        grant.deadline || '',
        grant.website || '',
        grant.application_url || '',
        grant.contact_info || '',
        grant.created_at || '',
        grant.updated_at || ''
      ].map(field => `"${field}"`).join(','); // Wrap fields in quotes
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `grants_export_${date}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Manage Grants
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Add, edit, or remove grants from the database
        </p>
      </div>

      {/* Search and Add */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search grants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          <MagnifyingGlassIcon
            className={`absolute left-3 top-2.5 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={filteredGrants.length === 0}
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export CSV
        </button>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Grant
        </button>
      </div>

      {/* Grants Table */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}">
            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Grant Name
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Organization
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Deadline
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Amount
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredGrants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No grants found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGrants.map(grant => (
                  <tr
                    key={grant.id}
                    className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div>
                        <div className="font-medium">{grant.name || 'Unnamed Grant'}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {grant.geographic_focus || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {grant.organization || 'Unknown'}
                    </td>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(grant.deadline)}
                    </td>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {grant.grant_size_min && grant.grant_size_max
                        ? `€${grant.grant_size_min.toLocaleString()} - €${grant.grant_size_max.toLocaleString()}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(grant)}
                        className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} mr-3`}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(grant.id)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <GrantEditModal
          grant={editingGrant}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default AdminGrants;
