import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { fetchGrantsForAdmin } from '../utils/adminApiHelper';
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon, 
  CalendarIcon,
  BanknotesIcon,
  GlobeAltIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const AdminAnalytics = () => {
  const { darkMode } = useContext(ThemeContext);
  const [grants, setGrants] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalGrants: 0,
    totalFunding: 0,
    averageFunding: 0,
    grantsByCountry: [],
    grantsByType: [],
    upcomingDeadlines: [],
    grantsByMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('all'); // all, filtered, analytics

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const grantsData = await fetchGrantsForAdmin();
      setGrants(grantsData);
      
      // Calculate analytics
      const totalGrants = grantsData.length;
      
      // Total funding calculation
      const totalFunding = grantsData.reduce((sum, grant) => {
        const max = grant.grant_size_max || 0;
        return sum + max;
      }, 0);
      
      // Average funding
      const averageFunding = totalGrants > 0 ? totalFunding / totalGrants : 0;
      
      // Grants by country
      const countryMap = {};
      grantsData.forEach(grant => {
        const country = grant.geographic_focus || 'Unknown';
        countryMap[country] = (countryMap[country] || 0) + 1;
      });
      const grantsByCountry = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Grants by type
      const typeMap = {};
      grantsData.forEach(grant => {
        const type = grant.type || 'Unknown';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const grantsByType = Object.entries(typeMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      // Upcoming deadlines (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = grantsData
        .filter(grant => {
          if (!grant.deadline) return false;
          const deadline = new Date(grant.deadline);
          return deadline >= today && deadline <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 10);
      
      // Grants by month (for the current year)
      const currentYear = new Date().getFullYear();
      const monthMap = {};
      grantsData.forEach(grant => {
        if (grant.created_at) {
          const date = new Date(grant.created_at);
          if (date.getFullYear() === currentYear) {
            const month = date.toLocaleString('default', { month: 'short' });
            monthMap[month] = (monthMap[month] || 0) + 1;
          }
        }
      });
      
      setAnalytics({
        totalGrants,
        totalFunding,
        averageFunding,
        grantsByCountry,
        grantsByType,
        upcomingDeadlines,
        grantsByMonth: Object.entries(monthMap).map(([month, count]) => ({ month, count }))
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const exportAnalyticsReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalGrants: analytics.totalGrants,
        totalFunding: analytics.totalFunding,
        averageFunding: analytics.averageFunding
      },
      grantsByCountry: analytics.grantsByCountry,
      grantsByType: analytics.grantsByType,
      upcomingDeadlines: analytics.upcomingDeadlines.map(g => ({
        name: g.name,
        organization: g.organization,
        deadline: g.deadline,
        amount: `€${g.grant_size_min || 0} - €${g.grant_size_max || 0}`
      })),
      grantsByMonth: analytics.grantsByMonth
    };

    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grants_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredGrants = (filter) => {
    let filteredGrants = grants;
    
    if (filter === 'upcoming') {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      filteredGrants = grants.filter(grant => {
        if (!grant.deadline) return false;
        const deadline = new Date(grant.deadline);
        return deadline >= today && deadline <= thirtyDaysFromNow;
      });
    } else if (filter === 'high-value') {
      filteredGrants = grants.filter(grant => grant.grant_size_max >= 100000);
    }

    const headers = [
      'Grant Name',
      'Organization',
      'Geographic Focus',
      'Focus Areas',
      'Grant Type',
      'Min Amount',
      'Max Amount',
      'Deadline',
      'Website',
      'Application URL'
    ];

    const csvRows = filteredGrants.map(grant => {
      return [
        grant.name || '',
        grant.organization || '',
        grant.geographic_focus || '',
        grant.focus_areas_en || '',
        grant.type || '',
        grant.grant_size_min || '',
        grant.grant_size_max || '',
        grant.deadline || '',
        grant.website || '',
        grant.application_url || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grants_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
          Analytics & Reports
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View analytics and export detailed reports
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Grants
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalGrants}
              </p>
            </div>
            <DocumentChartBarIcon className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Funding Available
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalFunding)}
              </p>
            </div>
            <BanknotesIcon className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Grant Size
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.averageFunding)}
              </p>
            </div>
            <ChartBarIcon className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-8`}>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Export Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={exportAnalyticsReport}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Analytics Report
          </button>
          
          <button
            onClick={() => exportFilteredGrants('all')}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            All Grants CSV
          </button>
          
          <button
            onClick={() => exportFilteredGrants('upcoming')}
            className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Upcoming Deadlines
          </button>
          
          <button
            onClick={() => exportFilteredGrants('high-value')}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            High-Value Grants
          </button>
        </div>
      </div>

      {/* Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grants by Country */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Grants by Geographic Focus
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.grantsByCountry.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.country}
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <CalendarIcon className="h-5 w-5 mr-2" />
              Upcoming Deadlines (30 days)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.upcomingDeadlines.length === 0 ? (
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No upcoming deadlines
                </p>
              ) : (
                analytics.upcomingDeadlines.map((grant, index) => (
                  <div key={index} className={`pb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-0 last:pb-0`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {grant.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {grant.organization} • {new Date(grant.deadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Digest Feature Guide */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mt-8`}>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Email Digest Feature (Implementation Guide)
        </h2>
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-4`}>
          <p>To implement automated email digests, follow these steps:</p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <div>
                <p className="font-semibold">Set up email service (Netlify Functions + SendGrid/SES)</p>
                <p className="text-sm mt-1">Create a new function: <code className="bg-gray-200 px-1 rounded">client/netlify/functions/email-digest.js</code></p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <div>
                <p className="font-semibold">Create subscription management</p>
                <p className="text-sm mt-1">Add database table for email subscriptions with preferences (frequency, filters)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <div>
                <p className="font-semibold">Implement digest templates</p>
                <ul className="text-sm mt-1 ml-4 list-disc">
                  <li>Weekly summary of new grants</li>
                  <li>Upcoming deadline reminders</li>
                  <li>Grants matching user preferences</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <div>
                <p className="font-semibold">Schedule automated sending</p>
                <p className="text-sm mt-1">Use Netlify scheduled functions or external cron service</p>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="font-semibold mb-2">Example Digest Content:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>5 new grants added this week</li>
              <li>3 grants with deadlines in the next 7 days</li>
              <li>Personalized recommendations based on organization type</li>
              <li>Total funding available: €2.5M</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;