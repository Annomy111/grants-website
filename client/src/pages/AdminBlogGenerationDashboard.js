import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  NewspaperIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  LanguageIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AdminBlogGenerationDashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [translationStats, setTranslationStats] = useState(null);
  const [aggregating, setAggregating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, translationResponse] = await Promise.all([
        axios.get('/api/blog-generation/dashboard'),
        axios.get('/api/blog-generation/translation-stats')
      ]);
      setDashboardData(dashboardResponse.data);
      setTranslationStats(translationResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleManualAggregation = async () => {
    setAggregating(true);
    try {
      const response = await axios.post('/api/blog-generation/aggregate-news');
      console.log('News aggregation completed:', response.data);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to aggregate news:', error);
    } finally {
      setAggregating(false);
    }
  };

  const getJobStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Blog Generation Dashboard
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered content generation based on Ukrainian civil society news
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleManualAggregation}
            disabled={aggregating}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              aggregating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {aggregating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            {aggregating ? 'Aggregating...' : 'Refresh News'}
          </button>
          <Link
            to="/admin/blog-generation/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate New Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <NewspaperIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Articles
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dashboardData?.newsStats?.total_articles || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This Week
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dashboardData?.newsStats?.this_week || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Organizations
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dashboardData?.organizationCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Leaders
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dashboardData?.leaderCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <LanguageIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Translations
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {translationStats?.translation_coverage || 0}%
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {translationStats?.translated_posts || 0}/{translationStats?.total_posts || 0} posts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs and News Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Generation Jobs */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Generation Jobs
            </h3>
          </div>
          <div className="p-6">
            {dashboardData?.recentJobs?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getJobStatusIcon(job.status)}
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.job_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : job.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No generation jobs yet
              </p>
            )}
            <div className="mt-4">
              <Link
                to="/admin/blog-generation/create"
                className={`text-sm text-blue-600 hover:text-blue-800 ${darkMode ? 'hover:text-blue-400' : ''}`}
              >
                Create new generation job →
              </Link>
            </div>
          </div>
        </div>

        {/* News Sources Status */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              News Sources
            </h3>
          </div>
          <div className="p-6">
            {dashboardData?.sourceStats?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.sourceStats.slice(0, 5).map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {source.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last checked: {source.last_checked ? formatDate(source.last_checked) : 'Never'}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {source.article_count} articles
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No news sources configured
              </p>
            )}
            <div className="mt-4">
              <Link
                to="/admin/blog-generation/sources"
                className={`text-sm text-blue-600 hover:text-blue-800 ${darkMode ? 'hover:text-blue-400' : ''}`}
              >
                Manage sources →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/blog-generation/create"
            className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <SparklesIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Content
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Create AI-generated blog posts
            </p>
          </Link>

          <Link
            to="/admin/blog-generation/create?bilingual=true"
            className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <GlobeAltIcon className="h-8 w-8 text-indigo-600 mb-2" />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bilingual Content
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate EN/UK blog posts
            </p>
          </Link>

          <Link
            to="/admin/blog-generation/sources"
            className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <NewspaperIcon className="h-8 w-8 text-green-600 mb-2" />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Sources
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure news sources
            </p>
          </Link>

          <Link
            to="/admin/blog-generation/settings"
            className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <CogIcon className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Settings
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure AI generation
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogGenerationDashboard;