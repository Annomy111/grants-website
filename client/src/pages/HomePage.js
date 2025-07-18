import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import VideoHero from '../components/VideoHero';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

const HomePage = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [featuredGrants, setFeaturedGrants] = useState([]);
  const [upcomingGrants, setUpcomingGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated statistics based on current database
  const stats = {
    totalGrants: 136,
    upcomingDeadlines: 52, // Active grants with 2025 deadlines
    totalFunding: 75, // €75M+ with new grants
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let grants;

        try {
          // First try to load from API endpoint
          const response = await axios.get('/.netlify/functions/grants');
          grants = response.data;
          console.log('HomePage: Loaded grants from API:', grants.length);
        } catch (apiError) {
          // Fallback to static JSON file with language support
          const currentLanguage = i18n.language;
          const grantsJsonPath =
            currentLanguage === 'uk' ? '/data/grants_uk.json' : '/data/grants.json';

          try {
            const staticResponse = await axios.get(grantsJsonPath);
            grants = staticResponse.data;
          } catch (grantsError) {
            // If language-specific file fails, fallback to English
            const staticResponse = await axios.get('/data/grants.json');
            grants = staticResponse.data;
          }
        }

        // Get featured grants (select specific high-value ones using correct field names)
        const featuredNames = [
          'EU Civil Society Organizations Call 2025',
          'German Marshall Fund (GMF) Ukraine: Relief, Resilience, Recovery (U3R) Program',
          'National Endowment for Democracy (NED) Regular Grants',
          'British Council - Connections Through Culture Grants 2025',
        ];

        console.log('Total grants loaded:', grants.length);
        console.log('Sample grant fields:', grants[0] ? Object.keys(grants[0]) : 'No grants');

        // Check both field name formats for compatibility
        const featured = grants.filter(g => 
          featuredNames.includes(g.grant_name) || featuredNames.includes(g['Grant Name'])
        );

        console.log('Featured grants found by name:', featured.length);

        // If not enough featured, add high-value ones
        if (featured.length < 3) {
          const remaining = grants
            .filter(g => !featured.includes(g))
            .filter(g => {
              // Prioritize grants with higher amounts or from major organizations
              const amount = g.grant_amount || g['Grant Amount'] || '';
              const org = g.funding_organization || g['Funding Organization'] || '';
              return amount.includes('€') && (
                amount.includes('million') || 
                org.includes('European Union') ||
                org.includes('World Bank') ||
                org.includes('United Nations')
              );
            })
            .slice(0, 3 - featured.length);
          featured.push(...remaining);
          console.log('Added high-value grants:', remaining.length);
        }

        // Final fallback to any grants if still not enough
        if (featured.length < 3) {
          const anyRemaining = grants
            .filter(g => !featured.includes(g))
            .slice(0, 3 - featured.length);
          featured.push(...anyRemaining);
          console.log('Added fallback grants:', anyRemaining.length);
        }

        // Absolute fallback - ensure we always have 3 grants
        if (featured.length === 0 && grants.length > 0) {
          featured.push(...grants.slice(0, 3));
          console.log('Emergency fallback: using first 3 grants');
        }

        console.log('Final featured grants count:', featured.length);
        console.log('Featured grants:', featured.map(g => g.grant_name || g['Grant Name'] || 'Unknown'));

        console.log('HomePage: Setting featured grants:', featured.length, featured.map(g => g.grant_name || g['Grant Name']));
        
        // Ensure we always have some featured grants
        if (featured.length === 0) {
          console.log('HomePage: No featured grants found, using first 3 grants as fallback');
          const fallbackGrants = grants.slice(0, 3);
          setFeaturedGrants(fallbackGrants);
        } else {
          setFeaturedGrants(featured);
        }

        // Get grants with upcoming deadlines (check both field name formats)
        const today = new Date();
        const upcomingDeadlineGrants = grants
          .filter(grant => {
            const deadline = grant.application_deadline || grant.deadline || grant['Application Deadline'];
            if (!deadline) return false;

            // Check for 2025-2026 dates or rolling deadlines
            if (deadline.includes('2025') || deadline.includes('2026') || deadline.toLowerCase().includes('rolling')) {
              try {
                // For actual dates, check if they're in the future
                const deadlineDate = new Date(deadline);
                if (!isNaN(deadlineDate.getTime())) {
                  return deadlineDate > today;
                } else {
                  // Include rolling deadlines and text-based deadlines
                  return true;
                }
              } catch (e) {
                return true; // Include if it mentions future years
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

  const formatDate = dateString => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = amount => {
    if (!amount) return 'Variable';

    // Handle range
    if (amount.includes('-')) {
      const parts = amount.split('-');
      return `${parts[0].trim()} - ${parts[1].trim()}`;
    }

    return amount;
  };

  return (
    <>
      <SEOHead 
        title={t('home.pageTitle', 'Ukraine Civil Society Grants - Find Funding Opportunities')}
        description={t('home.metaDescription', 'Discover 136 grants worth €75M+ for civil society organizations in Ukraine. Find international funding opportunities, EU grants, and humanitarian aid.')}
        keywords={t('home.keywords', 'ukraine grants, civil society funding, NGO grants ukraine, EU funding ukraine, humanitarian grants, international aid ukraine')}
      />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      
      <main id="main-content" className={`home-page min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Video Hero Section */}
      <VideoHero
        darkMode={darkMode}
        title={{
          line1: t('home.hero.title1', 'Civil Society'),
          line2: t('home.hero.title2', 'Grants Platform'),
        }}
        subtitle={t(
          'home.hero.subtitle',
          'Connecting Ukrainian civil society organizations with €75M+ in funding opportunities'
        )}
        primaryCTA={{
          text: t('home.hero.exploreGrants', 'Explore Grants'),
          link: '/grants',
        }}
        secondaryCTA={{
          text: t('home.hero.learnMore', 'Learn More'),
          link: '/about',
        }}
      />

      {/* Original content continues below - remove the old hero section */}
      {/* Stats Section */}
      <section className={`relative py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`} aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {t('home.stats.title', 'Making Impact Through Funding')}
            </h2>
          </div>
          <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div
                className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}
              >
                {stats.totalGrants}
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.totalGrants', 'Active Grants')}
              </div>
            </div>
            <div
              className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div
                className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}
              >
                €{stats.totalFunding}M+
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.totalFunding', 'Total Funding Available')}
              </div>
            </div>
            <div
              className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div
                className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}
              >
                {stats.upcomingDeadlines}
              </div>
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('home.stats.upcomingDeadlines', 'Upcoming Deadlines')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Matching Wizard CTA Section */}
      <section className={`py-16 ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-yellow-900/20' : 'bg-gradient-to-br from-blue-50 to-yellow-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('home.wizard.title', 'Find Your Perfect Grant Match')}
            </h2>
            <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('home.wizard.subtitle', 'Get AI-powered grant recommendations tailored to your Ukrainian civil society organization')}
            </p>
            <Link
              to="/grants/wizard"
              className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-yellow-500 text-white hover:from-blue-600 hover:to-yellow-600' 
                  : 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white hover:from-blue-700 hover:to-yellow-600'
              } shadow-xl hover:shadow-2xl`}
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t('home.wizard.button', 'Start Grant Matching Wizard')}
            </Link>
            <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('home.wizard.time', 'Takes only 2 minutes • Get instant recommendations')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Grants - Minimal cards */}
      <section className="py-20" aria-label="Featured grant opportunities">
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
                <div
                  className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                  style={{ animationDelay: '0s' }}
                ></div>
                <div
                  className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="featured-grants-grid grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGrants.map((grant, index) => {
                console.log(`Rendering grant ${index}:`, grant?.grant_name || grant?.['Grant Name'] || 'UNDEFINED', grant?.funding_organization || grant?.['Funding Organization'] || 'UNDEFINED');
                
                // Safety check to ensure grant exists
                if (!grant) {
                  console.log(`Grant ${index} is null/undefined, skipping`);
                  return null;
                }
                
                return (
                <div
                  key={index}
                  className={`group relative rounded-3xl overflow-hidden ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Colored accent top */}
                  <div
                    className={`h-2 ${
                      index === 0
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : index === 1
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                  ></div>

                  <div className="p-8">
                    <div className="mb-6">
                      <p
                        className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {grant.funding_organization || grant['Funding Organization']}
                      </p>
                      <h3
                        className={`text-xl font-bold mb-3 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {grant.grant_name || grant['Grant Name']}
                      </h3>
                      <p
                        className={`text-sm line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {grant.focus_areas || grant['Focus Areas']}
                      </p>
                    </div>

                    {/* Key info pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatCurrency(grant.grant_amount || grant['Grant Amount'])}
                      </span>
                      {(grant.application_deadline || grant['Application Deadline']) &&
                        (grant.application_deadline || grant['Application Deadline']) !== 'Rolling' && (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {formatDate(grant.application_deadline || grant['Application Deadline'])}
                          </span>
                        )}
                    </div>

                    <Link
                      to={`/grants?query=${encodeURIComponent(grant.grant_name || grant['Grant Name'])}`}
                      className={`inline-flex items-center text-sm font-medium ${
                        darkMode
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-blue-600 hover:text-blue-700'
                      } group-hover:underline transition-colors`}
                    >
                      View details
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/grants"
                className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-xl ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                View all grants
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                to="/grants/wizard"
                className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-xl ${
                  darkMode
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                } transition-colors duration-200`}
              >
                {t('wizard.title', 'Grant Matching Wizard')}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines - Clean table */}
      {upcomingGrants.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`} aria-label="Upcoming application deadlines">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Upcoming Deadlines
              </h2>
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't miss these application windows
              </p>
            </div>

            <div
              className={`rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <tr>
                      <th
                        className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Grant
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Organization
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Deadline
                      </th>
                      <th
                        className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {upcomingGrants.map((grant, index) => (
                      <tr
                        key={index}
                        className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td
                          className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}
                        >
                          {grant.grant_name || grant['Grant Name']}
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {grant.funding_organization || grant['Funding Organization']}
                        </td>
                        <td className={`px-6 py-4`}>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {grant.application_deadline || grant.deadline || grant['Application Deadline']}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/grants?query=${encodeURIComponent(grant.grant_name || grant['Grant Name'])}`}
                            className={`inline-flex items-center text-sm font-medium ${
                              darkMode
                                ? 'text-blue-400 hover:text-blue-300'
                                : 'text-blue-600 hover:text-blue-700'
                            } hover:underline`}
                          >
                            View
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
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
      </main>
    </>
  );
};

export default HomePage;
