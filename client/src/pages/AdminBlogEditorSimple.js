import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

const AdminBlogEditorSimple = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    title_uk: '',
    slug: '',
    content: '',
    content_uk: '',
    excerpt: '',
    excerpt_uk: '',
    status: 'draft',
    categories: [],
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blog/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    }
  };

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/blog/post/${id}`);
      const post = response.data;
      setFormData({
        title: post.title || '',
        title_uk: post.title_uk || '',
        slug: post.slug || '',
        content: post.content || '',
        content_uk: post.content_uk || '',
        excerpt: post.excerpt || '',
        excerpt_uk: post.excerpt_uk || '',
        status: post.status || 'draft',
        categories: post.categories?.map(c => c.id) || [],
      });
      if (post.featured_image) {
        setImagePreview(post.featured_image);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError('Failed to load post');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleCategoryChange = categoryId => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'categories') {
          // Add each category separately
          formData[key].forEach(catId => {
            data.append('categories', catId);
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (featuredImage) {
        data.append('featured_image', featuredImage);
      }

      let response;
      if (isEditing) {
        response = await axios.put(`/api/blog/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Blog post updated successfully!');
      } else {
        response = await axios.post('/api/blog', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Blog post created successfully!');
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin/blog');
      }, 1500);
    } catch (error) {
      console.error('Failed to save post:', error);
      setError(error.response?.data?.error || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/blog')}
          className={`flex items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mb-4`}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Blog Posts
        </button>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Title (English) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Title (Ukrainian)
              </label>
              <input
                type="text"
                name="title_uk"
                value={formData.title_uk}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                placeholder="auto-generated-from-title"
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label
              className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Featured Image
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded" />
              )}
              <label
                className={`cursor-pointer flex items-center px-4 py-2 rounded-md ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label
              className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <label
                  key={category.id}
                  className={`flex items-center px-3 py-1 rounded-full cursor-pointer ${
                    formData.categories.includes(category.id)
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="hidden"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Excerpts */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Excerpts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Excerpt (English)
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the blog post..."
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Excerpt (Ukrainian)
              </label>
              <textarea
                name="excerpt_uk"
                value={formData.excerpt_uk}
                onChange={handleChange}
                rows={3}
                placeholder="Короткий опис блог посту..."
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        {/* Content - Using simple textareas instead of Quill */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Content
          </h2>

          <div className="space-y-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Content (English) * <span className="text-xs text-gray-500">(HTML supported)</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                placeholder="<p>Enter your blog content here...</p>"
                className={`w-full px-3 py-2 rounded-md border font-mono text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Content (Ukrainian) <span className="text-xs text-gray-500">(HTML supported)</span>
              </label>
              <textarea
                name="content_uk"
                value={formData.content_uk}
                onChange={handleChange}
                rows={10}
                placeholder="<p>Введіть ваш контент тут...</p>"
                className={`w-full px-3 py-2 rounded-md border font-mono text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;,
              &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;,
              &lt;blockquote&gt;, etc.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className={`px-6 py-2 rounded-md ${
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
            className={`px-6 py-2 rounded-md text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditorSimple;
