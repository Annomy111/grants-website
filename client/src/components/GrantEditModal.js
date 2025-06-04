import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const GrantEditModal = ({ grant, onClose, onSave, darkMode }) => {
  const [formData, setFormData] = useState({
    grant_name: '',
    funding_organization: '',
    country_region: '',
    eligibility_criteria: '',
    focus_areas: '',
    grant_amount: '',
    application_deadline: '',
    duration: '',
    website_link: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (grant) {
      // Convert date to YYYY-MM-DD format for input
      const deadline = grant.application_deadline ? 
        new Date(grant.application_deadline).toISOString().split('T')[0] : '';
      
      setFormData({
        ...grant,
        application_deadline: deadline
      });
    }
  }, [grant]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (grant) {
        // Update existing grant
        await axios.put(`/api/grants/${grant.id}`, formData);
      } else {
        // Create new grant
        await axios.post('/api/grants', formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save grant:', error);
      setError(error.response?.data?.error || 'Failed to save grant');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {grant ? 'Edit Grant' : 'Add New Grant'}
              </h3>
              <button
                onClick={onClose}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Grant Name *
                  </label>
                  <input
                    type="text"
                    name="grant_name"
                    value={formData.grant_name}
                    onChange={handleChange}
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
                    Funding Organization *
                  </label>
                  <input
                    type="text"
                    name="funding_organization"
                    value={formData.funding_organization}
                    onChange={handleChange}
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
                    Country/Region
                  </label>
                  <input
                    type="text"
                    name="country_region"
                    value={formData.country_region}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Grant Amount
                  </label>
                  <input
                    type="text"
                    name="grant_amount"
                    value={formData.grant_amount}
                    onChange={handleChange}
                    placeholder="e.g., $10,000 - $50,000"
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 12 months"
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Focus Areas
                </label>
                <textarea
                  name="focus_areas"
                  value={formData.focus_areas}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Eligibility Criteria
                </label>
                <textarea
                  name="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website Link
                </label>
                <input
                  type="text"
                  name="website_link"
                  value={formData.website_link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
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
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {loading ? 'Saving...' : grant ? 'Update Grant' : 'Add Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantEditModal;