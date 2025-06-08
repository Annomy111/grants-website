import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { format } from 'date-fns';
import { createRoot } from 'react-dom/client';
import { ThemeContext } from '../context/ThemeContext';
import { CalendarIcon, UserIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  KeyStatisticsInfographic,
  FocusAreasInfographic,
  TimelineInfographic,
  RegionalImpactInfographic,
  InternationalSupportInfographic,
  FuturePrioritiesInfographic,
  CallToActionInfographic
} from '../components/infographics/UkraineCivilSocietyInfographicsIndex';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post && contentRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        renderInfographics();
      }, 100);
    }
  }, [post, darkMode]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/.netlify/functions/blog/slug/${slug}`);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError('Post not found');
      setLoading(false);
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

  const getLocalizedContent = (field) => {
    if (!post) return '';
    const isUkrainian = i18n.language === 'uk';
    const ukField = `${field}_uk`;
    return (isUkrainian && post[ukField]) ? post[ukField] : post[field];
  };

  const renderInfographics = () => {
    const infographicContainers = contentRef.current?.querySelectorAll('.infographic-container');
    
    console.log('Rendering infographics, found containers:', infographicContainers?.length);
    
    if (!infographicContainers || infographicContainers.length === 0) return;
    
    infographicContainers.forEach(container => {
      const id = container.id;
      console.log('Processing container with id:', id);
      let InfographicComponent = null;
      
      switch(id) {
        case 'key-statistics':
          InfographicComponent = KeyStatisticsInfographic;
          break;
        case 'focus-areas':
          InfographicComponent = FocusAreasInfographic;
          break;
        case 'timeline':
          InfographicComponent = TimelineInfographic;
          break;
        case 'regional-impact':
          InfographicComponent = RegionalImpactInfographic;
          break;
        case 'international-support':
          InfographicComponent = InternationalSupportInfographic;
          break;
        case 'future-priorities':
          InfographicComponent = FuturePrioritiesInfographic;
          break;
        case 'call-to-action':
          InfographicComponent = CallToActionInfographic;
          break;
        default:
          break;
      }
      
      if (InfographicComponent) {
        // Clear container
        container.innerHTML = '';
        
        // Create root and render component
        const root = createRoot(container);
        root.render(<InfographicComponent darkMode={darkMode} />);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('blog.postNotFound', 'Post Not Found')}
          </h1>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('blog.postNotFoundDesc', 'The blog post you are looking for does not exist.')}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('blog.backToBlog', 'Back to Blog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`blog-post-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen py-8`}>
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className={`inline-flex items-center mb-6 ${
            darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('blog.backToBlog', 'Back to Blog')}
        </button>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={post.featured_image}
              alt={getLocalizedContent('title')}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {getLocalizedContent('title')}
          </h1>

          <div className={`flex flex-wrap items-center gap-4 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {formatDate(post.published_at)}
            </div>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              {post.author_name}
            </div>
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                <div className="flex flex-wrap gap-2">
                  {post.categories.map(category => (
                    <span
                      key={category.id}
                      className={`px-3 py-1 rounded-full text-xs ${
                        darkMode 
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {i18n.language === 'uk' && category.name_uk ? category.name_uk : category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div className={`prose prose-lg max-w-none ${
          darkMode ? 'prose-invert' : ''
        }`}>
          <div 
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: getLocalizedContent('content') }}
            className={`
              ${darkMode ? 'text-gray-300' : 'text-gray-700'}
              [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-8
              [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-6
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4
              [&>p]:mb-4 [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
              [&>li]:mb-2
              [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4
              [&>a]:text-blue-600 [&>a]:hover:text-blue-700 [&>a]:underline
              [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-6
              [&>pre]:bg-gray-100 [&>pre]:dark:bg-gray-800 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-4
              [&>code]:bg-gray-100 [&>code]:dark:bg-gray-800 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
              [&_.infographic-container]:my-8 [&_.infographic-container]:p-6 [&_.infographic-container]:rounded-xl 
              [&_.infographic-container]:bg-gray-100 [&_.infographic-container]:dark:bg-gray-800
              [&_.infographic-container]:flex [&_.infographic-container]:justify-center [&_.infographic-container]:items-center
              [&_.infographic-container]:overflow-x-auto [&_.infographic-container]:min-h-[400px]
            `}
          />
        </div>

        {/* Share Section */}
        <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('blog.sharePost', 'Share this post')}
          </h3>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getLocalizedContent('title'))}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;