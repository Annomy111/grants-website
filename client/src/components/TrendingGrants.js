import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { TrendingUpIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import analytics from '../utils/analytics';

const TrendingGrants = ({ limit = 5, showViewCount = true }) => {
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [trendingGrants, setTrendingGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingGrants();
  }, [limit]);

  const fetchTrendingGrants = async () => {
    try {
      const grants = await analytics.getPopularGrants(limit);
      setTrendingGrants(grants);
    } catch (error) {
      console.error('Failed to fetch trending grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return t('grants.noDeadline');
    
    const date = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return t('grants.expired');
    if (daysUntil === 0) return t('grants.deadlineToday');
    if (daysUntil === 1) return t('grants.deadlineTomorrow');
    if (daysUntil <= 7) return t('grants.deadlineDays', { days: daysUntil });
    
    return date.toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingGrants.length === 0) {
    return null;
  }

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center mb-6">
        <TrendingUpIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('trendingGrants.title')}
        </h3>
      </div>

      <div className="space-y-4">
        {trendingGrants.map((grant, index) => (
          <Link
            key={grant.id}
            to={`/grants/${grant.id}`}
            className={`block p-4 rounded-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className={`text-lg font-bold mr-2 ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    index === 2 ? 'text-orange-600' : 
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {grant.grant_name}
                  </h4>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {grant.funding_organization}
                </p>

                <div className="flex items-center space-x-4 text-sm">
                  {showViewCount && (
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {grant.view_count} {t('trendingGrants.views')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span className={`${
                      new Date(grant.application_deadline) < new Date() 
                        ? 'text-red-500' 
                        : darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDeadline(grant.application_deadline)}
                    </span>
                  </div>
                </div>

                {grant.focus_areas && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {grant.focus_areas.split(',').slice(0, 3).map((area, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          darkMode 
                            ? 'bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/grants"
        className={`block text-center mt-6 py-2 px-4 rounded-lg transition-colors duration-200 ${
          darkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {t('trendingGrants.viewAll')}
      </Link>
    </div>
  );
};

export default TrendingGrants;