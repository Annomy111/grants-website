import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import {
  DocumentTextIcon,
  NewspaperIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AdminOverview = () => {
  const { darkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    totalGrants: 0,
    upcomingDeadlines: 0,
    totalPosts: 0,
    publishedPosts: 0
  });
  const [recentGrants, setRecentGrants] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch grants
      const grantsResponse = await axios.get('/api/grants');
      const grants = grantsResponse.data;
      
      // Calculate stats
      const today = new Date();
      const upcomingDeadlines = grants.filter(grant => {
        if (!grant.application_deadline) return false;
        const deadline = new Date(grant.application_deadline);
        return deadline > today;
      }).length;

      // Fetch blog posts
      const postsResponse = await axios.get('/api/blog?status=all');
      const posts = postsResponse.data;
      const publishedPosts = posts.filter(post => post.status === 'published').length;

      setStats({
        totalGrants: grants.length,
        upcomingDeadlines,
        totalPosts: posts.length,
        publishedPosts
      });

      // Set recent items
      setRecentGrants(grants.slice(0, 5));
      setRecentPosts(posts.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
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
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <DocumentTextIcon className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalGrants}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Grants</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
              <CalendarIcon className={`h-8 w-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.upcomingDeadlines}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Deadlines</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
              <NewspaperIcon className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalPosts}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Blog Posts</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
              <UserGroupIcon className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.publishedPosts}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Published Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Grants */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Grants
              </h3>
              <Link
                to="/admin/grants"
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentGrants.length === 0 ? (
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No grants found
              </p>
            ) : (
              <div className="space-y-4">
                {recentGrants.map((grant) => (
                  <div
                    key={grant.id}
                    className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-0 last:pb-0`}
                  >
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {grant.grant_name}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {grant.funding_organization}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Deadline: {formatDate(grant.application_deadline)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Blog Posts
              </h3>
              <Link
                to="/admin/blog"
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentPosts.length === 0 ? (
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No blog posts found
              </p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-0 last:pb-0`}
                  >
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {post.title}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      By {post.author_name} • {post.status}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;