import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ChartBarIcon, TrendingUpIcon, CalendarIcon, 
  EyeIcon, SearchIcon, ExternalLinkIcon 
} from '@heroicons/react/24/outline';

const GrantAnalytics = ({ grantId, grantName }) => {
  const { darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrantAnalytics();
  }, [grantId]);

  const fetchGrantAnalytics = async () => {
    try {
      const response = await fetch(`/.netlify/functions/analytics?action=grantStats&grantId=${grantId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return null;
  }

  const chartColors = {
    primary: darkMode ? '#60A5FA' : '#3B82F6',
    secondary: darkMode ? '#A78BFA' : '#8B5CF6',
    tertiary: darkMode ? '#34D399' : '#10B981',
    background: darkMode ? '#1F2937' : '#F3F4F6',
    text: darkMode ? '#E5E7EB' : '#374151'
  };

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {t('grantAnalytics.title')}
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('grantAnalytics.totalViews')}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.view_count || 0}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('grantAnalytics.last30Days')}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.viewsLast30Days || 0}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('grantAnalytics.externalClicks')}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.external_clicks || 0}
              </p>
            </div>
            <ExternalLinkIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('grantAnalytics.searchAppearances')}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.search_appearances || 0}
              </p>
            </div>
            <SearchIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* View Timeline Chart */}
      {analytics.viewTimeline && analytics.viewTimeline.length > 0 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
          <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('grantAnalytics.viewsOverTime')}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.viewTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.text} opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke={chartColors.text}
                tick={{ fill: chartColors.text }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartColors.background,
                  border: 'none',
                  borderRadius: '8px',
                  color: chartColors.text
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={chartColors.primary} 
                strokeWidth={2}
                dot={{ fill: chartColors.primary }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional Insights */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('grantAnalytics.insights')}
        </h4>
        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {analytics.last_viewed && (
            <li>
              {t('grantAnalytics.lastViewed')}: {new Date(analytics.last_viewed).toLocaleString()}
            </li>
          )}
          {analytics.click_through_rate && (
            <li>
              {t('grantAnalytics.clickThroughRate')}: {analytics.click_through_rate}%
            </li>
          )}
          {analytics.average_time_on_page && (
            <li>
              {t('grantAnalytics.avgTimeOnPage')}: {Math.round(analytics.average_time_on_page / 60)} minutes
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GrantAnalytics;