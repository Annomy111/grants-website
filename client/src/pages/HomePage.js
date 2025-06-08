import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import VideoHero from '../components/VideoHero';

const HomePage = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [featuredGrants, setFeaturedGrants] = useState([]);
  const [upcomingGrants, setUpcomingGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Accurate statistics based on our analysis
  const stats = {
    totalGrants: 107,
    upcomingDeadlines: 45, // Active grants
    totalFunding: 63 // €63M+
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let grants;

        try {
          // First try to load from API endpoint
          const response = await axios.get('/.netlify/functions/grants');
          grants = response.data;
        } catch (apiError) {
          // Fallback to static JSON file with language support
          const currentLanguage = i18n.language;
          const grantsJsonPath = currentLanguage === 'uk' ? '/data/grants_uk.json' : '/data/grants.json';
          
          try {
            const staticResponse = await axios.get(grantsJsonPath);
            grants = staticResponse.data;
          } catch (grantsError) {
            // If language-specific file fails, fallback to English
            const staticResponse = await axios.get('/data/grants.json');
            grants = staticResponse.data;
          }
        }
        
        // Get featured grants (select specific high-value ones)
        const featuredNames = [
          "Swedish-Norwegian Civil Society Resilience Project",
          "USAID Civil Society Sectoral Support", 
          "EU Civil Society Organizations Call 2025"
        ];
        
        const featured = grants.filter(g => 
          featuredNames.includes(g['Grant Name'])
        );
        
        // If not enough featured, add random ones
        if (featured.length < 3) {
          const remaining = grants
            .filter(g => !featured.includes(g))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3 - featured.length);
          featured.push(...remaining);
        }
        
        setFeaturedGrants(featured);
        
        // Get grants with 2025 deadlines
        const today = new Date();
        const upcomingDeadlineGrants = grants
          .filter(grant => {
            const deadline = grant['Application Deadline'];
            if (!deadline) return false;
            
            // Check for 2025 dates
            if (deadline.includes('2025')) {
              try {
                const deadlineDate = new Date(deadline);
                return !isNaN(deadlineDate.getTime()) && deadlineDate > today;
              } catch (e) {
                return true; // Include if it mentions 2025
              }
            }
            return false;
          })
          .slice(0, 5);
          
        setUpcomingGrants(upcomingDeadlineGrants);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Variable';
    
    // Handle range
    if (amount.includes('-')) {
      const parts = amount.split('-');
      return `${parts[0].trim()} - ${parts[1].trim()}`;
    }
    
    return amount;
  };

  return (
    <div className={`home-page min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Video Hero Section */}
      <VideoHero 
        darkMode={darkMode}
        title={{
          line1: t('home.hero.title1', 'Civil Society'),
          line2: t('home.hero.title2', 'Grants Platform')
        }}
        subtitle={t('home.hero.subtitle', 'Connecting Ukrainian civil society organizations with €63M+ in funding opportunities')}
        primaryCTA={{
          text: t('home.hero.exploreGrants', 'Explore Grants'),
          link: '/grants'
        }}
        secondaryCTA={{
          text: t('home.hero.learnMore', 'Learn More'),
          link: '/about'
        }}
      />

      {/* Original content continues below - remove the old hero section */}
      {/* Stats Section */}
      <section className={`relative py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('home.stats.title', 'Making Impact Through Funding')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                {stats.totalGrants}
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.totalGrants', 'Active Grants')}
              </div>
            </div>
            <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
                €{stats.totalFunding}M+
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.totalFunding', 'Total Funding Available')}
              </div>
            </div>
            <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                {stats.upcomingDeadlines}
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.upcomingDeadlines', 'Upcoming Deadlines')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Grants */}
            <div className={`relative overflow-hidden rounded-3xl p-8 ${
              darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
            } shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} mb-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalGrants}
                </h3>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Available Grants
                </p>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100/30'} blur-2xl`}></div>
            </div>

            {/* Active Opportunities */}
            <div className={`relative overflow-hidden rounded-3xl p-8 ${
              darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
            } shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl ${darkMode ? 'bg-green-900/30' : 'bg-green-100'} mb-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.upcomingDeadlines}
                </h3>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Active Opportunities
                </p>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${darkMode ? 'bg-green-900/20' : 'bg-green-100/30'} blur-2xl`}></div>
            </div>

            {/* Total Funding */}
            <div className={`relative overflow-hidden rounded-3xl p-8 ${
              darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
            } shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} mb-4`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  €{stats.totalFunding}M+
                </h3>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Funding
                </p>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${darkMode ? 'bg-purple-900/20' : 'bg-purple-100/30'} blur-2xl`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grants - Minimal cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Opportunities
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              High-impact funding for transformative projects
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-1">
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0s'}}></div>
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGrants.map((grant, index) => (
                <div 
                  key={index} 
                  className={`group relative rounded-3xl overflow-hidden ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Colored accent top */}
                  <div className={`h-2 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                    index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 
                    'bg-gradient-to-r from-green-500 to-green-600'
                  }`}></div>
                  
                  <div className="p-8">
                    <div className="mb-6">
                      <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {grant['Funding Organization']}
                      </p>
                      <h3 className={`text-xl font-bold mb-3 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {grant['Grant Name']}
                      </h3>
                      <p className={`text-sm line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {grant['Focus Areas']}
                      </p>
                    </div>
                    
                    {/* Key info pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formatCurrency(grant['Grant Amount'])}
                      </span>
                      {grant['Application Deadline'] && grant['Application Deadline'] !== 'Rolling' && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {formatDate(grant['Application Deadline'])}
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      to={`/grants?query=${encodeURIComponent(grant['Grant Name'])}`} 
                      className={`inline-flex items-center text-sm font-medium ${
                        darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                      } group-hover:underline transition-colors`}
                    >
                      View details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              to="/grants" 
              className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-xl ${
                darkMode 
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              View all grants
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines - Clean table */}
      {upcomingGrants.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Deadlines
              </h2>
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't miss these application windows
              </p>
            </div>

            <div className={`rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Grant
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Organization
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Deadline
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {upcomingGrants.map((grant, index) => (
                      <tr key={index} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {grant['Grant Name']}
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {grant['Funding Organization']}
                        </td>
                        <td className={`px-6 py-4`}>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                          }`}>
                            {grant['Application Deadline']}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/grants?query=${encodeURIComponent(grant['Grant Name'])}`} 
                            className={`inline-flex items-center text-sm font-medium ${
                              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            } hover:underline`}
                          >
                            View
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;