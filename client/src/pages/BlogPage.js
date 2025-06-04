import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import { CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchCategories();
    }
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/.netlify/functions/blog');
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Generate categories from posts for now
      if (posts.length > 0) {
        const uniqueCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];
        setCategories(uniqueCategories.map(cat => ({ id: cat, name: cat, slug: cat })));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getLocalizedContent = (post, field) => {
    const isUkrainian = i18n.language === 'uk';
    const ukField = `${field}_uk`;
    return (isUkrainian && post[ukField]) ? post[ukField] : post[field];
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => 
        post.category && post.category === selectedCategory
      );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`blog-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen py-8`}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('blog.title', 'Blog & News')}
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('blog.subtitle', 'Latest updates, success stories, and grant writing tips')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {t('blog.allCategories', 'All Categories')}
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {i18n.language === 'uk' && category.name_uk ? category.name_uk : category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('blog.noPosts', 'No blog posts found in this category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {post.featured_image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={getLocalizedContent(post, 'title')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className={`text-xl font-bold mb-2 line-clamp-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {getLocalizedContent(post, 'title')}
                    </Link>
                  </h2>
                  
                  <div className={`flex items-center gap-4 text-sm mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(post.published_at)}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {post.author_name}
                    </div>
                  </div>
                  
                  {post.category && (
                    <div className="flex items-center mb-4">
                      <TagIcon className={`h-4 w-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {post.category}
                      </span>
                    </div>
                  )}
                  
                  {getLocalizedContent(post, 'excerpt') && (
                    <p className={`line-clamp-3 mb-4 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {getLocalizedContent(post, 'excerpt')}
                    </p>
                  )}
                  
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('blog.readMore', 'Read More')} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;