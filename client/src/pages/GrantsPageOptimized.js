import React, { useState, useEffect, useCallback, useContext, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import GrantsChatWidget from '../components/GrantsChatWidget';
import { useDebounce } from '../utils/debounce';
import { cachedFetch } from '../utils/cache';
import { LazyImage } from '../utils/lazyLoad';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

// Items per page for pagination
const ITEMS_PER_PAGE = 20;

// Memoized grant card component
const GrantCard = memo(({ 
  grant, 
  index, 
  darkMode, 
  isExpanded, 
  onToggleExpand,
  getLocalizedField,
  getOrganizationLogo,
  formatDate,
  calculateDaysRemaining,
  t
}) => {
  const deadline = grant.application_deadline || grant['Application Deadline'];
  const daysDiff = calculateDaysRemaining(deadline);
  const isExpired = daysDiff !== null && daysDiff < 0;
  const isUrgent = daysDiff !== null && daysDiff >= 0 && daysDiff <= 7;
  
  const logoUrl = getOrganizationLogo(
    grant.funding_organization || grant['Funding Organization']
  );

  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        isExpired
          ? darkMode
            ? 'bg-gray-800/50 border border-red-700/30 opacity-60'
            : 'bg-gray-50 border border-red-200 opacity-75'
          : darkMode
            ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50 hover:shadow-xl hover:border-gray-600/50'
            : 'bg-white/80 backdrop-blur border border-gray-200/50 hover:shadow-xl'
      } transition-all duration-300`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {logoUrl && (
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} p-2`}
              >
                <LazyImage
                  src={logoUrl}
                  alt={`${grant.funding_organization || grant['Funding Organization']} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h2
                className={`text-xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {getLocalizedField(grant, 'grant_name') ||
                  getLocalizedField(grant, 'Grant Name')}
              </h2>
              <p
                className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {getLocalizedField(grant, 'funding_organization') ||
                  getLocalizedField(grant, 'Funding Organization')}
              </p>
            </div>
          </div>
          {/* Status Badge */}
          <div
            className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
              isExpired
                ? darkMode
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-red-100 text-red-600'
                : isUrgent
                  ? darkMode
                    ? 'bg-orange-900/20 text-orange-400'
                    : 'bg-orange-100 text-orange-600'
                  : darkMode
                    ? 'bg-green-900/20 text-green-400'
                    : 'bg-green-100 text-green-600'
            }`}
          >
            {isExpired ? 'EXPIRED' : isUrgent ? `${daysDiff} DAYS LEFT` : 'OPEN'}
          </div>
        </div>
        
        {/* Key Information Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            {getLocalizedField(grant, 'grant_amount') ||
              getLocalizedField(grant, 'Grant Amount') ||
              'Amount varies'}
          </div>
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {formatDate(deadline)}
          </div>
        </div>

        {/* Action Section */}
        <div className="flex justify-end items-center gap-3 mt-4">
          <button
            onClick={() => onToggleExpand(index)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
              darkMode
                ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isExpanded ? 'Show less' : 'View details'}
          </button>
          {(grant.website_link || grant['Website Link']) && (
            <a
              href={(() => {
                const link = grant.website_link || grant['Website Link'];
                const urlPart = link.includes(':http')
                  ? link.substring(link.indexOf(':http') + 1)
                  : link;
                return urlPart.startsWith('http')
                  ? urlPart
                  : `https://${urlPart}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center rounded-xl py-2.5 px-5 font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } shadow-sm hover:shadow-md`}
            >
              {t('grants.applyNow')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

GrantCard.displayName = 'GrantCard';

const GrantsPageOptimized = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { darkMode } = useContext(ThemeContext);
  const [allGrants, setAllGrants] = useState([]);
  const [displayedGrants, setDisplayedGrants] = useState([]);
  const [filteredGrants, setFilteredGrants] = useState([]);
  const [filters, setFilters] = useState({
    organizations: [],
    focusAreas: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedGrants, setExpandedGrants] = useState(new Set());
  const [organizationLogos, setOrganizationLogos] = useState({});
  
  // Form state with debouncing
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [sortBy, setSortBy] = useState('deadlineAsc');
  const [showExpired, setShowExpired] = useState(false);

  // Memoized helper functions
  const getLocalizedField = useCallback((grant, fieldName) => {
    const isUkrainian = i18n.language === 'uk';
    const fieldMap = {
      grant_name: isUkrainian ? 'grant_name_uk' : 'grant_name',
      'Grant Name': isUkrainian ? 'grant_name_uk' : 'grant_name',
      funding_organization: isUkrainian ? 'funding_organization_uk' : 'funding_organization',
      'Funding Organization': isUkrainian ? 'funding_organization_uk' : 'funding_organization',
      // ... other fields
    };
    const actualFieldName = fieldMap[fieldName] || fieldName;
    return grant[actualFieldName] || grant[fieldName] || '';
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  }, []);

  const calculateDaysRemaining = useCallback((deadlineString) => {
    if (!deadlineString) return null;
    const today = new Date();
    const deadline = new Date(deadlineString);
    if (isNaN(deadline.getTime())) return null;
    return Math.round((deadline - today) / (1000 * 60 * 60 * 24));
  }, []);

  const getOrganizationLogo = useCallback((organizationName) => {
    if (!organizationName) return null;
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    const logoData = organizationLogos[slug];
    return logoData?.hasLogo ? logoData.logo : null;
  }, [organizationLogos]);

  // Sort grants function
  const sortGrants = useCallback((grantsToSort, sortCriteria) => {
    const sorted = [...grantsToSort];
    switch (sortCriteria) {
      case 'nameAsc':
        return sorted.sort((a, b) =>
          (a['Grant Name'] || '').localeCompare(b['Grant Name'] || '')
        );
      case 'nameDesc':
        return sorted.sort((a, b) =>
          (b['Grant Name'] || '').localeCompare(a['Grant Name'] || '')
        );
      case 'deadlineAsc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a['Application Deadline'] || '9999-12-31');
          const dateB = new Date(b['Application Deadline'] || '9999-12-31');
          return dateA - dateB;
        });
      case 'deadlineDesc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a['Application Deadline'] || '0000-01-01');
          const dateB = new Date(b['Application Deadline'] || '0000-01-01');
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  }, []);

  // Apply filters function
  const applyFilters = useCallback(() => {
    let filtered = [...allGrants];

    // Text search with debounced term
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(grant => {
        const grantName = grant.grant_name || grant['Grant Name'] || '';
        const organization = grant.funding_organization || grant['Funding Organization'] || '';
        const focusAreas = grant.focus_areas || grant['Focus Areas'] || '';
        const eligibility = grant.eligibility_criteria || grant['Eligibility Criteria'] || '';

        return (
          grantName.toLowerCase().includes(term) ||
          organization.toLowerCase().includes(term) ||
          focusAreas.toLowerCase().includes(term) ||
          eligibility.toLowerCase().includes(term)
        );
      });
    }

    // Organization filter
    if (selectedOrganization) {
      filtered = filtered.filter(grant => {
        const organization = grant.funding_organization || grant['Funding Organization'];
        return organization === selectedOrganization;
      });
    }

    // Focus area filter
    if (selectedFocusArea) {
      filtered = filtered.filter(grant => {
        const focusAreas = grant.focus_areas || grant['Focus Areas'] || '';
        return focusAreas.toLowerCase().includes(selectedFocusArea.toLowerCase());
      });
    }

    // Filter out expired grants unless showExpired is true
    if (!showExpired) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(grant => {
        const deadlineField = grant.application_deadline || grant['Application Deadline'];
        if (!deadlineField) return true;

        const deadline = new Date(deadlineField);
        if (isNaN(deadline.getTime())) return true;

        return deadline >= today;
      });
    }

    // Apply sorting
    filtered = sortGrants(filtered, sortBy);

    setFilteredGrants(filtered);
    // Reset displayed grants for pagination
    setDisplayedGrants(filtered.slice(0, ITEMS_PER_PAGE));
  }, [
    allGrants,
    debouncedSearchTerm,
    selectedOrganization,
    selectedFocusArea,
    sortBy,
    showExpired,
    sortGrants,
  ]);

  // Infinite scroll handler
  const fetchMoreGrants = useCallback(async (page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newGrants = filteredGrants.slice(startIndex, endIndex);
    
    if (newGrants.length > 0) {
      setDisplayedGrants(prev => [...prev, ...newGrants]);
    }
  }, [filteredGrants]);

  const hasMore = useMemo(() => 
    displayedGrants.length < filteredGrants.length,
    [displayedGrants.length, filteredGrants.length]
  );

  const { sentinelRef, loading: loadingMore } = useInfiniteScroll(
    fetchMoreGrants,
    hasMore,
    { threshold: 200, initialLoad: false }
  );

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load organization logos
        try {
          const logosResponse = await cachedFetch('/data/organization-logos.json');
          setOrganizationLogos(logosResponse.data);
        } catch (logosError) {
          console.log('Organization logos file not found');
        }

        let grantsData;
        let filtersData;

        try {
          // Try API first with caching
          const grantsResponse = await cachedFetch('/.netlify/functions/grants');
          grantsData = grantsResponse.data;

          const filtersResponse = await cachedFetch('/.netlify/functions/grants/filters');
          filtersData = filtersResponse.data;
        } catch (apiError) {
          // Fallback to static JSON
          const currentLanguage = i18n.language;
          const grantsJsonPath =
            currentLanguage === 'uk' ? '/data/grants_uk.json' : '/data/grants.json';
          const filtersJsonPath =
            currentLanguage === 'uk' ? '/data/filters_uk.json' : '/data/filters.json';

          const grantsResponse = await cachedFetch(grantsJsonPath);
          grantsData = grantsResponse.data;

          const filtersResponse = await cachedFetch(filtersJsonPath);
          filtersData = filtersResponse.data;
        }

        setAllGrants(grantsData);
        setFilters(filtersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when data is loaded or filters change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [loading, applyFilters]);

  const toggleGrantExpansion = useCallback((index) => {
    setExpandedGrants(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrganization('');
    setSelectedFocusArea('');
    setSortBy('deadlineAsc');
    setShowExpired(false);
    setSearchParams({});
  };

  return (
    <div
      className={`grants-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8`}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}
        >
          {t('grants.search')}
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('grants.subtitle', 'Find the perfect grant opportunity for your organization')}
        </p>
      </div>

      {/* Simplified Filter Bar */}
      <div className="max-w-7xl mx-auto mb-12">
        <div
          className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50' : 'bg-white/80 backdrop-blur border border-gray-200/50'} transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base`}
                placeholder={t('grants.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute left-3 top-3.5 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Organization Filter */}
            <select
              className={`w-full px-4 py-3.5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base appearance-none cursor-pointer`}
              value={selectedOrganization}
              onChange={e => setSelectedOrganization(e.target.value)}
            >
              <option value="">{t('grants.allOrganizations', 'All Organizations')}</option>
              {filters.organizations.map((org, index) => (
                <option key={index} value={org}>
                  {org}
                </option>
              ))}
            </select>

            {/* Focus Area Filter */}
            <select
              className={`w-full px-4 py-3.5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base appearance-none cursor-pointer`}
              value={selectedFocusArea}
              onChange={e => setSelectedFocusArea(e.target.value)}
            >
              <option value="">{t('grants.allFocusAreas', 'All Focus Areas')}</option>
              {filters.focusAreas.map((area, index) => (
                <option key={index} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            <button
              onClick={resetFilters}
              className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${!searchTerm && !selectedOrganization && !selectedFocusArea ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!searchTerm && !selectedOrganization && !selectedFocusArea}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              {t('grants.clearFilters', 'Clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Results Header with Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {filteredGrants.length} {t('grants.resultsFound', 'grants found')}
              {displayedGrants.length < filteredGrants.length && 
                ` (showing ${displayedGrants.length})`
              }
            </div>
            <label
              className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
            >
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={showExpired}
                onChange={e => setShowExpired(e.target.checked)}
              />
              <span className="text-sm">{t('grants.showExpired', 'Show expired')}</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('grants.sortBy', 'Sort by')}:
            </span>
            <select
              className={`px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-gray-800/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer pr-10`}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="deadlineAsc">
                {t('grants.sortOptions.deadlineAsc', 'Deadline (Soonest)')}
              </option>
              <option value="deadlineDesc">
                {t('grants.sortOptions.deadlineDesc', 'Deadline (Latest)')}
              </option>
              <option value="nameAsc">{t('grants.sortOptions.nameAsc', 'Name (A-Z)')}</option>
              <option value="nameDesc">{t('grants.sortOptions.nameDesc', 'Name (Z-A)')}</option>
            </select>
          </div>
        </div>

        {/* Grants List */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-24">
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
            <>
              {filteredGrants.length === 0 ? (
                <div
                  className={`p-12 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur' : 'bg-gray-50'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p
                    className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('grants.noResults')}
                  </p>
                  <p className={`mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedGrants.map((grant, index) => (
                    <GrantCard
                      key={`${grant.id || index}-${grant['Grant Name']}`}
                      grant={grant}
                      index={index}
                      darkMode={darkMode}
                      isExpanded={expandedGrants.has(index)}
                      onToggleExpand={toggleGrantExpansion}
                      getLocalizedField={getLocalizedField}
                      getOrganizationLogo={getOrganizationLogo}
                      formatDate={formatDate}
                      calculateDaysRemaining={calculateDaysRemaining}
                      t={t}
                    />
                  ))}
                  
                  {/* Infinite scroll sentinel */}
                  {hasMore && (
                    <div ref={sentinelRef} className="h-10 flex items-center justify-center">
                      {loadingMore && (
                        <div className="flex space-x-1">
                          <div
                            className={`w-2 h-6 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                            style={{ animationDelay: '0s' }}
                          ></div>
                          <div
                            className={`w-2 h-6 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className={`w-2 h-6 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* AI Chat Widget */}
      <GrantsChatWidget />
    </div>
  );
};

export default GrantsPageOptimized;