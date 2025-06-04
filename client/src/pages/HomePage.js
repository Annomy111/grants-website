import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';

const HomePage = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [featuredGrants, setFeaturedGrants] = useState([]);
  const [upcomingGrants, setUpcomingGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGrants: 0,
    upcomingDeadlines: 0,
    totalFunding: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let grants;

        try {
          // First try to load from API endpoint
          const response = await axios.get('/api/grants');
          grants = response.data;
          console.log('Loaded grants from API endpoint');
        } catch (apiError) {
          console.log('API endpoint failed, falling back to static data');
          // Fallback to static JSON file with language support
          const currentLanguage = i18n.language;
          const grantsJsonPath = currentLanguage === 'uk' ? '/data/grants_uk.json' : '/data/grants.json';
          
          console.log(`Loading ${currentLanguage} language data files`);
          
          try {
            const staticResponse = await axios.get(grantsJsonPath);
            grants = staticResponse.data;
            console.log(`Loaded grants from ${currentLanguage} static JSON file`);
          } catch (grantsError) {
            // If language-specific file fails, fallback to English
            console.log('Language-specific file failed, falling back to English data');
            const staticResponse = await axios.get('/data/grants.json');
            grants = staticResponse.data;
            console.log('Loaded grants from English static JSON file');
          }
        }
        
        // Get featured grants (randomly selecting 3)
        const randomGrants = [...grants].sort(() => 0.5 - Math.random()).slice(0, 3);
        setFeaturedGrants(randomGrants);
        
        // Get upcoming deadlines
        const today = new Date();
        const upcomingDeadlineGrants = grants
          .filter(grant => {
            if (!grant['Application Deadline']) return false;
            
            const deadlineDate = new Date(grant['Application Deadline']);
            return !isNaN(deadlineDate.getTime()) && deadlineDate > today;
          })
          .sort((a, b) => {
            const dateA = new Date(a['Application Deadline']);
            const dateB = new Date(b['Application Deadline']);
            return dateA - dateB;
          })
          .slice(0, 4);
        
        // Calculate statistics
        const totalGrants = grants.length;
        const upcomingDeadlines = grants.filter(grant => {
          if (!grant['Application Deadline']) return false;
          const deadlineDate = new Date(grant['Application Deadline']);
          return !isNaN(deadlineDate.getTime()) && deadlineDate > today;
        }).length;
        
        // Estimate total funding available (very rough calculation)
        let totalFunding = 0;
        grants.forEach(grant => {
          const amountText = grant['Grant Amount'] || '';
          const match = amountText.match(/([€$£]?\s*\d[\d.,]*)/i);
          if (match) {
            const amountStr = match[0].replace(/[^0-9.]/g, '');
            const amount = parseFloat(amountStr);
            if (!isNaN(amount)) {
              // Assuming most amounts are in thousands
              totalFunding += amount > 1000 ? amount : amount * 1000;
            }
          }
        });
        
        setStats({
          totalGrants,
          upcomingDeadlines,
          totalFunding
        });
          
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

  return (
    <div className={`home-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Hero Section with Stats */}
      <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl overflow-hidden mb-10 transition-colors duration-300`}>
        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className={`text-3xl md:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} leading-tight transition-colors duration-300`}>
                {t('home.title')}
              </h1>
              
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                {t('home.subtitle')}
              </p>
              
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} transition-colors duration-300`}>
                {t('home.description')}
              </p>
              
              <div className="pt-4">
                <Link 
                  to="/grants" 
                  className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium 
                    ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} 
                    transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg`}
                >
                  {t('home.browseGrants')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Stats Cards - Bento Grid Style */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} p-6 rounded-xl border transition-colors duration-300`}>
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.totalGrants}
                </div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Available Grants</div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-100'} p-6 rounded-xl border transition-colors duration-300`}>
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.upcomingDeadlines}
                </div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upcoming Deadlines</div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-100'} p-6 rounded-xl border col-span-2 transition-colors duration-300`}>
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  €{Math.round(stats.totalFunding / 1000000).toLocaleString()}M+
                </div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Funding Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grants - Bento Grid Style */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
              {t('home.featuredGrants')}
            </h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
              Highlighted funding opportunities for civil society organizations
            </p>
          </div>
          <Link 
            to="/grants" 
            className={`inline-flex items-center px-4 py-2 rounded-lg 
              ${darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} 
              transition-colors duration-300`}
          >
            {t('home.viewAll')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className={`relative h-16 w-16`}>
              <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
              <div className={`absolute top-0 left-0 animate-ping h-16 w-16 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} opacity-20`}></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGrants.map((grant, index) => (
              <div 
                key={index} 
                className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} 
                  shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full`}
              >
                <div className={`${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-purple-600' : 'bg-green-600'} text-white px-6 py-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate text-lg">{grant['Funding Organization']}</h3>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      {grant['Country/Region']?.split('/')[0] || 'International'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className={`font-bold text-xl mb-3 ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-2`}>
                    {grant['Grant Name']}
                  </h4>
                  
                  <div className={`mb-4 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="text-sm line-clamp-3">
                      {grant['Focus Areas']}
                    </p>
                  </div>
                  
                  <div className="mt-auto space-y-4">
                    <div className={`flex justify-between items-center pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div>
                        <p className={`text-xs uppercase font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t('grants.deadline')}</p>
                        <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {formatDate(grant['Application Deadline'])}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs uppercase font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t('grants.amount')}</p>
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {grant['Grant Amount'] || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/grants?query=${encodeURIComponent(grant['Grant Name'])}`} 
                      className={`flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-colors duration-200
                        ${darkMode 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                      {t('grants.viewDetails')}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Deadlines */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
              {t('home.upcomingDeadlines')}
            </h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
              Don't miss these approaching application windows
            </p>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Urgent opportunities</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className={`relative h-16 w-16`}>
              <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
              <div className={`absolute top-0 left-0 animate-ping h-16 w-16 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} opacity-20`}></div>
            </div>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
                  <tr>
                    <th className={`py-4 px-6 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('grants.organization')}
                    </th>
                    <th className={`py-4 px-6 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('grantDetail.grantDetails')}
                    </th>
                    <th className={`py-4 px-6 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('grants.deadline')}
                    </th>
                    <th className={`py-4 px-6 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('grants.viewDetails')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                  {upcomingGrants.map((grant, index) => {
                    // Calculate days until deadline
                    const today = new Date();
                    const deadline = new Date(grant['Application Deadline']);
                    const daysDiff = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr 
                        key={index} 
                        className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}
                      >
                        <td className={`py-4 px-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="font-medium">{grant['Funding Organization']}</div>
                          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{grant['Country/Region']}</div>
                        </td>
                        <td className={`py-4 px-6 ${darkMode ? 'text-white' : 'text-gray-800'} font-medium`}>
                          {grant['Grant Name']}
                        </td>
                        <td className="py-4 px-6">
                          <div className={`font-medium ${daysDiff <= 7 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-yellow-400' : 'text-yellow-600')}`}>
                            {formatDate(grant['Application Deadline'])}
                          </div>
                          {daysDiff <= 7 && (
                            <div className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
                              {daysDiff <= 0 ? 'Due today!' : `${daysDiff} day${daysDiff !== 1 ? 's' : ''} left`}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link 
                            to={`/grants?query=${encodeURIComponent(grant['Grant Name'])}`} 
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
                              ${darkMode 
                                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
                              transition-colors duration-200`}
                          >
                            {t('grants.viewDetails')}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
