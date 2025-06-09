import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const GrantComparisonModal = ({ grants, isOpen, onClose }) => {
  const { darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !grants || grants.length < 2) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getFieldValue = (grant, field) => {
    // Support both database and static JSON formats
    const fieldMap = {
      name: grant.grant_name || grant['Grant Name'],
      organization: grant.funding_organization || grant['Funding Organization'],
      amount: grant.grant_amount || grant['Grant Amount'],
      deadline: grant.application_deadline || grant['Application Deadline'],
      duration: grant.duration || grant['Duration'],
      eligibility: grant.eligibility_criteria || grant['Eligibility Criteria'],
      focusAreas: grant.focus_areas || grant['Focus Areas'],
      region: grant.country_region || grant['Country/Region'],
      website: grant.website_link || grant['Website Link'],
    };
    return fieldMap[field] || 'N/A';
  };

  const calculateDaysRemaining = (deadline) => {
    if (!deadline || deadline === 'Rolling') return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return null;
    return Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  const ComparisonRow = ({ label, field, format }) => (
    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <td className={`py-4 px-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </td>
      {grants.map((grant, index) => {
        const value = getFieldValue(grant, field);
        const formattedValue = format ? format(value) : value;
        
        return (
          <td
            key={index}
            className={`py-4 px-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
          >
            {field === 'deadline' && value !== 'Rolling' && value !== 'N/A' ? (
              <div>
                <div>{formatDate(value)}</div>
                {calculateDaysRemaining(value) !== null && (
                  <div
                    className={`text-xs mt-1 ${
                      calculateDaysRemaining(value) < 0
                        ? 'text-red-500'
                        : calculateDaysRemaining(value) <= 7
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }`}
                  >
                    {calculateDaysRemaining(value) < 0
                      ? 'Expired'
                      : `${calculateDaysRemaining(value)} days left`}
                  </div>
                )}
              </div>
            ) : (
              <div className={field === 'focusAreas' || field === 'eligibility' ? 'text-sm' : ''}>
                {formattedValue}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl
          ${darkMode ? 'bg-gray-900' : 'bg-white'}
          animate-in fade-in zoom-in duration-300
        `}
      >
        {/* Header */}
        <div
          className={`
            sticky top-0 z-10 px-6 py-4 border-b
            ${darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('grants.compareGrants', 'Compare Grants')}
            </h2>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }
              `}
              aria-label="Close comparison"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <table className="w-full">
            <thead
              className={`sticky top-0 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="py-3 px-4 text-left font-medium">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Criteria
                  </span>
                </th>
                {grants.map((grant, index) => (
                  <th key={index} className="py-3 px-4 text-left">
                    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
                      <div className="font-semibold text-lg">
                        {getFieldValue(grant, 'name')}
                      </div>
                      <div
                        className={`text-sm font-normal ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {getFieldValue(grant, 'organization')}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow label="Grant Amount" field="amount" />
              <ComparisonRow label="Application Deadline" field="deadline" />
              <ComparisonRow label="Duration" field="duration" />
              <ComparisonRow label="Region" field="region" />
              <ComparisonRow label="Focus Areas" field="focusAreas" />
              <ComparisonRow label="Eligibility Criteria" field="eligibility" />
            </tbody>
          </table>

          {/* Action buttons */}
          <div
            className={`
              sticky bottom-0 px-6 py-4 border-t
              ${darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
              }
            `}
          >
            <div className="flex justify-between items-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comparing {grants.length} grants
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                >
                  Close
                </button>
                {grants.map((grant, index) => (
                  <a
                    key={index}
                    href={getFieldValue(grant, 'website')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-colors
                      ${darkMode
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }
                    `}
                  >
                    Apply to {getFieldValue(grant, 'organization')}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantComparisonModal;