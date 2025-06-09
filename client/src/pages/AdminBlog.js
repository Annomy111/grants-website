import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { fetchBlogPostsForAdmin } from '../utils/adminApiHelper';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminBlog = () => {
  const { darkMode } = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Get all posts (published and drafts) for admin view
      const postsData = await fetchBlogPostsForAdmin();
      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('authToken'); // Fixed: was looking for 'token' instead of 'authToken'
      await axios.delete(`/.netlify/functions/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken'); // Fixed: was looking for 'token' instead of 'authToken'
      await axios.put(
        `/.netlify/functions/blog/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchPosts();
    } catch (error) {
      console.error('Failed to update post status:', error);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(post => post.status === filter);

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
          Blog Posts
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your blog posts and announcements
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'published'
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Published ({posts.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'draft'
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Drafts ({posts.filter(p => p.status === 'draft').length})
          </button>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Post
        </Link>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPosts.length === 0 ? (
          <div
            className={`col-span-2 text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}
          >
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No blog posts found</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {post.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  By {post.author_name} • {formatDate(post.created_at)}
                </p>

                {post.excerpt && (
                  <p
                    className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}
                  >
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/blog/edit/${post.id}`}
                      className={`p-2 rounded ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className={`p-2 rounded ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    {post.status === 'published' && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  {post.status === 'draft' ? (
                    <button
                      onClick={() => handleStatusChange(post.id, 'published')}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(post.id, 'draft')}
                      className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
