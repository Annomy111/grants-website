import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  SparklesIcon,
  DocumentTextIcon,
  LanguageIcon,
  PhotoIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const AdminBlogGenerationCreate = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    organization_ids: [],
    leader_ids: [],
    keywords: [],
    tone: 'informative',
    length: 'medium',
    language: 'en',
    includeStatistics: true,
    includeMedia: true,
    generateSocialMedia: false,
    schedule: {
      enabled: false,
      date: '',
      time: ''
    }
  });

  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedTab, setSelectedTab] = useState('settings');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [orgsResponse, leadersResponse, settingsResponse] = await Promise.all([
        axios.get('/api/blog-generation/organizations'),
        axios.get('/api/blog-generation/leaders'),
        axios.get('/api/blog-generation/settings')
      ]);
      
      setOrganizations(orgsResponse.data.organizations || []);
      setLeaders(leadersResponse.data.leaders || []);
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'scheduleDate' || name === 'scheduleTime') {
      const field = name === 'scheduleDate' ? 'date' : 'time';
      setFormData(prev => ({
        ...prev,
        schedule: { ...prev.schedule, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeywordAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const keyword = e.target.value.trim();
      if (!formData.keywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword]
        }));
      }
      e.target.value = '';
    }
  };

  const handleKeywordRemove = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleOrganizationToggle = (orgId) => {
    setFormData(prev => ({
      ...prev,
      organization_ids: prev.organization_ids.includes(orgId)
        ? prev.organization_ids.filter(id => id !== orgId)
        : [...prev.organization_ids, orgId]
    }));
  };

  const handleLeaderToggle = (leaderId) => {
    setFormData(prev => ({
      ...prev,
      leader_ids: prev.leader_ids.includes(leaderId)
        ? prev.leader_ids.filter(id => id !== leaderId)
        : [...prev.leader_ids, leaderId]
    }));
  };

  const handleGenerateContent = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic for the blog post');
      return;
    }

    setGeneratingContent(true);
    try {
      // Add timeout to axios request
      const response = await axios.post('/api/blog-generation/generate', {
        parameters: {
          topic: formData.topic,
          keywords: formData.keywords,
          tone: formData.tone,
          length: formData.length,
          language: formData.language,
          includeStatistics: formData.includeStatistics,
          includeMedia: formData.includeMedia,
          organizationIds: formData.organization_ids,
          leaderIds: formData.leader_ids
        }
      }, {
        timeout: 90000 // 90 second timeout
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setGeneratedContent(response.data);
      setSelectedTab('preview');
      
      // Show success message about saving as draft
      if (response.data.blogPostId) {
        console.log(`✅ Blog post saved as draft with ID: ${response.data.blogPostId}`);
        
        // Optional: Show a temporary success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Blog post saved as draft!
          </div>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 4000);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      let errorMessage = 'Failed to generate content. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'The request timed out. Please try again.';
      } else if (error.response?.data?.details) {
        errorMessage += error.response.data.details;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleSavePost = async () => {
    if (!generatedContent) return;

    setLoading(true);
    try {
      const postData = {
        title: formData.title || generatedContent.title,
        content: generatedContent.content,
        summary: generatedContent.summary,
        keywords: formData.keywords.join(', '),
        author_name: generatedContent.author || 'AI Blog Generator',
        status: formData.schedule.enabled ? 'scheduled' : 'published',
        language: formData.language,
        featured_image: generatedContent.media?.[0]?.url || null,
        meta_description: generatedContent.summary,
        scheduled_for: formData.schedule.enabled 
          ? `${formData.schedule.date}T${formData.schedule.time}:00` 
          : null,
        generation_metadata: {
          topic: formData.topic,
          tone: formData.tone,
          length: formData.length,
          organizations: formData.organization_ids,
          leaders: formData.leader_ids,
          statistics_included: formData.includeStatistics,
          media_included: formData.includeMedia
        }
      };

      const response = await axios.post('/api/blog', postData);
      
      // If multilingual, create translation
      if (formData.language === 'uk' && settings?.auto_translate) {
        await axios.post(`/api/blog/${response.data.id}/translate`, {
          targetLanguage: 'en'
        });
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardClass = `${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`;
  const inputClass = `mt-1 block w-full rounded-md ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Generate New Blog Post
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create AI-powered content based on current Ukrainian civil society news
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blog-generation')}
          className={`p-2 rounded-lg ${
            darkMode 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } transition-colors`}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setSelectedTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`
            } ${!generatedContent ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!generatedContent}
          >
            Preview
          </button>
        </nav>
      </div>

      {/* Content */}
      {selectedTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Ukrainian civil society response to humanitarian crisis"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Leave empty to auto-generate"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="Type a keyword and press Enter"
                    onKeyDown={handleKeywordAdd}
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {keyword}
                        <button
                          onClick={() => handleKeywordRemove(keyword)}
                          className="ml-2 hover:text-red-500"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Settings */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Content Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tone
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="informative">Informative</option>
                    <option value="analytical">Analytical</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="urgent">Urgent</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Length
                  </label>
                  <select
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="short">Short (300-500 words)</option>
                    <option value="medium">Medium (500-800 words)</option>
                    <option value="long">Long (800-1200 words)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="en">English</option>
                    <option value="uk">Ukrainian</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeStatistics"
                    checked={formData.includeStatistics}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Include relevant statistics
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeMedia"
                    checked={formData.includeMedia}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Include images and media
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="generateSocialMedia"
                    checked={formData.generateSocialMedia}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Generate social media posts
                  </span>
                </label>
              </div>
            </div>

            {/* Schedule Settings */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Publishing Schedule
              </h3>
              
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.schedule.enabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, enabled: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Schedule for later
                </span>
              </label>

              {formData.schedule.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </label>
                    <input
                      type="date"
                      name="scheduleDate"
                      value={formData.schedule.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time
                    </label>
                    <input
                      type="time"
                      name="scheduleTime"
                      value={formData.schedule.time}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizations */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Organizations
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {organizations.map(org => (
                  <label key={org.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.organization_ids.includes(org.id)}
                      onChange={() => handleOrganizationToggle(org.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {org.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Leaders */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Leaders
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaders.map(leader => (
                  <label key={leader.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.leader_ids.includes(leader.id)}
                      onChange={() => handleLeaderToggle(leader.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {leader.full_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateContent}
                disabled={generatingContent || !formData.topic.trim()}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                  generatingContent || !formData.topic.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium`}
              >
                {generatingContent ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Content
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/admin/blog-generation')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={cardClass}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {generatedContent?.title || 'Generated Title'}
              </h2>
              
              {generatedContent?.media && generatedContent.media.length > 0 && (
                <img 
                  src={generatedContent.media[0].url} 
                  alt={generatedContent.media[0].title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div 
                className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}
                dangerouslySetInnerHTML={{ __html: generatedContent?.content || '' }}
              />

              {generatedContent?.statistics && typeof generatedContent.statistics === 'object' && Object.keys(generatedContent.statistics).length > 0 && (
                <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Key Statistics
                  </h4>
                  <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {Object.entries(generatedContent.statistics).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value || '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Metadata */}
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Metadata
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Language
                  </dt>
                  <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formData.language === 'en' ? 'English' : 'Ukrainian'}
                  </dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Word Count
                  </dt>
                  <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {generatedContent?.content ? generatedContent.content.split(' ').length : 0} words
                  </dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Reading Time
                  </dt>
                  <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {Math.ceil((generatedContent?.content ? generatedContent.content.split(' ').length : 0) / 200)} min
                  </dd>
                </div>
              </dl>
            </div>

            {/* Draft Status */}
            {generatedContent?.blogPostId && (
              <div className={`${cardClass} border-l-4 border-green-500`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-green-500" />
                  Saved as Draft
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  This post has been automatically saved as a draft in your blog management system.
                </p>
                <div className="space-y-2">
                  <div>
                    <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </dt>
                    <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Post ID
                    </dt>
                    <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      #{generatedContent.blogPostId}
                    </dd>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/blog')}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View in Blog Management
                </button>
              </div>
            )}

            {/* Social Media Preview */}
            {generatedContent?.socialMedia && (
              <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Social Media Posts
                </h3>
                <div className="space-y-3">
                  {generatedContent.socialMedia.twitter && (
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Twitter/X
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {generatedContent.socialMedia.twitter}
                      </p>
                    </div>
                  )}
                  {generatedContent.socialMedia.linkedin && (
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        LinkedIn
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {generatedContent.socialMedia.linkedin}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Options */}
            <div className="space-y-3">
              <button
                onClick={handleSavePost}
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    {formData.schedule.enabled ? 'Schedule Post' : 'Publish Post'}
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedTab('settings')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors font-medium`}
              >
                Back to Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogGenerationCreate;