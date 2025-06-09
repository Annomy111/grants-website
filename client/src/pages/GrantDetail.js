import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const GrantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrant = async () => {
      try {
        const response = await axios.get('/.netlify/functions/grants');
        const allGrants = response.data;

        // Find the grant matching the query parameter
        const foundGrant = allGrants.find(g => g['Grant Name'] === decodeURIComponent(id));

        if (foundGrant) {
          setGrant(foundGrant);
        } else {
          setError('Grant not found');
          setTimeout(() => navigate('/grants'), 3000);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching grant details:', err);
        setError('Failed to load grant details');
        setLoading(false);
      }
    };

    fetchGrant();
  }, [id, navigate]);

  const formatDate = dateString => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <p className="mt-2 text-sm text-red-600">Redirecting to grants page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grant) {
    return null;
  }

  const getWebsiteUrl = link => {
    if (!link) return '#';
    return link.startsWith('http') ? link : `https://${link}`;
  };

  const handlePrintPDF = () => {
    // Create a print-specific style
    const printStyles = `
      @media print {
        /* Hide non-essential elements */
        .no-print {
          display: none !important;
        }
        
        /* Reset colors for better printing */
        * {
          background: white !important;
          color: black !important;
        }
        
        /* Ensure proper page breaks */
        .grant-detail {
          page-break-inside: avoid;
        }
        
        /* Style adjustments for print */
        .bg-blue-700 {
          background-color: #f3f4f6 !important;
          border-bottom: 2px solid #000 !important;
        }
        
        .text-blue-100 {
          color: #374151 !important;
        }
        
        a {
          text-decoration: underline !important;
        }
        
        /* Add grant info header for print */
        @page {
          margin: 1in;
        }
        
        .print-header::before {
          content: "Civil Society Grants Database";
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 20px;
        }
        
        .print-header::after {
          content: "Generated on: " attr(data-date);
          font-size: 10px;
          color: #666;
          display: block;
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }
    `;

    // Inject print styles
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    // Add date attribute for print
    const printHeader = document.querySelector('.print-header');
    if (printHeader) {
      printHeader.setAttribute('data-date', new Date().toLocaleDateString());
    }

    // Trigger print dialog
    window.print();

    // Clean up styles after print
    setTimeout(() => {
      document.head.removeChild(styleElement);
    }, 1000);
  };

  return (
    <div className="grant-detail">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link
          to="/grants"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t('grantDetail.backToGrants')}
        </Link>
        <button
          onClick={handlePrintPDF}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 print-header">
        <div className="bg-blue-700 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">{grant['Grant Name']}</h1>
          <p className="text-blue-100 text-lg">{grant['Funding Organization']}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {t('grantDetail.grantDetails')}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.organization')}</h3>
                  <p className="text-gray-800">{grant['Funding Organization']}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.country')}</h3>
                  <p className="text-gray-800">{grant['Country/Region']}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.amount')}</h3>
                  <p className="text-gray-800 font-semibold">
                    {grant['Grant Amount'] || 'Not specified'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.deadline')}</h3>
                  <p className="text-red-600 font-semibold">
                    {formatDate(grant['Application Deadline'])}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.duration')}</h3>
                  <p className="text-gray-800">{grant['Duration'] || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.eligibility')}</h3>
                  <p className="text-gray-800 whitespace-pre-line">
                    {grant['Eligibility Criteria']}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.focusAreas')}</h3>
                  <p className="text-gray-800 whitespace-pre-line">{grant['Focus Areas']}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">{t('grantDetail.website')}</h3>
                  <a
                    href={getWebsiteUrl(grant['Website Link'])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {grant['Website Link']}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center no-print">
            <a
              href={getWebsiteUrl(grant['Website Link'])}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block transition duration-200"
            >
              {t('grantDetail.applyNow')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantDetail;
