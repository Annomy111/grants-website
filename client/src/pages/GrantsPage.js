import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import GrantsChatWidget from '../components/GrantsChatWidget';

const GrantsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { darkMode } = useContext(ThemeContext);
  const [grants, setGrants] = useState([]);
  const [filteredGrants, setFilteredGrants] = useState([]);
  
  // Helper function to get the correct field based on current language
  const getLocalizedField = (grant, fieldName) => {
    const isUkrainian = i18n.language === 'uk';
    
    // Map of English field names to Ukrainian field names
    const fieldMap = {
      'grant_name': isUkrainian ? 'grant_name_uk' : 'grant_name',
      'Grant Name': isUkrainian ? 'grant_name_uk' : 'grant_name',
      'funding_organization': isUkrainian ? 'funding_organization_uk' : 'funding_organization',
      'Funding Organization': isUkrainian ? 'funding_organization_uk' : 'funding_organization',
      'country_region': isUkrainian ? 'country_region_uk' : 'country_region',
      'Country/Region': isUkrainian ? 'country_region_uk' : 'country_region',
      'eligibility_criteria': isUkrainian ? 'eligibility_criteria_uk' : 'eligibility_criteria',
      'Eligibility Criteria': isUkrainian ? 'eligibility_criteria_uk' : 'eligibility_criteria',
      'focus_areas': isUkrainian ? 'focus_areas_uk' : 'focus_areas',
      'Focus Areas': isUkrainian ? 'focus_areas_uk' : 'focus_areas',
      'grant_amount': isUkrainian ? 'grant_amount_uk' : 'grant_amount',
      'Grant Amount': isUkrainian ? 'grant_amount_uk' : 'grant_amount',
      'duration': isUkrainian ? 'duration_uk' : 'duration',
      'Duration': isUkrainian ? 'duration_uk' : 'duration',
      'application_procedure': isUkrainian ? 'application_procedure_uk' : 'application_procedure',
      'required_documents': isUkrainian ? 'required_documents_uk' : 'required_documents',
      'evaluation_criteria': isUkrainian ? 'evaluation_criteria_uk' : 'evaluation_criteria',
      'additional_requirements': isUkrainian ? 'additional_requirements_uk' : 'additional_requirements',
      'reporting_requirements': isUkrainian ? 'reporting_requirements_uk' : 'reporting_requirements',
      'detailed_description': isUkrainian ? 'detailed_description_uk' : 'detailed_description'
    };
    
    // Get the appropriate field name
    const actualFieldName = fieldMap[fieldName] || fieldName;
    
    // Return the value from the grant object, checking both database and JSON formats
    return grant[actualFieldName] || grant[fieldName] || '';
  };
  
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    organizations: [],
    focusAreas: []
  });

  // Form state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [sortBy, setSortBy] = useState('deadlineAsc');
  const [showExpired, setShowExpired] = useState(false);
  const [expandedGrants, setExpandedGrants] = useState(new Set());
  const [organizationLogos, setOrganizationLogos] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        let grantsData;
        let filtersData;
        let logosData = {};

        // Load organization logos
        try {
          const logosResponse = await axios.get('/data/organization-logos.json');
          logosData = logosResponse.data;
          setOrganizationLogos(logosData);
        } catch (logosError) {
          console.log('Organization logos not available');
        }

        try {
          // First try to fetch from API (direct function endpoints)
          const grantsResponse = await axios.get('/.netlify/functions/grants');
          grantsData = grantsResponse.data;
          
          const filtersResponse = await axios.get('/.netlify/functions/grants/filters');
          filtersData = filtersResponse.data;
          
          console.log('Loaded data from API endpoint');
        } catch (apiError) {
          console.log('API endpoint failed, falling back to static JSON data');
          // Fallback to static JSON files with language support
          const currentLanguage = i18n.language;
          const grantsJsonPath = currentLanguage === 'uk' ? '/data/grants_uk.json' : '/data/grants.json';
          const filtersJsonPath = currentLanguage === 'uk' ? '/data/filters_uk.json' : '/data/filters.json';
          
          console.log(`Loading ${currentLanguage} language data files`);
          
          try {
            const grantsResponse = await axios.get(grantsJsonPath);
            grantsData = grantsResponse.data;
            
            try {
              const filtersResponse = await axios.get(filtersJsonPath);
              filtersData = filtersResponse.data;
            } catch (filtersError) {
              // Generate filters from grants data if filters.json fails
              console.log('Generating filters from grants data');
              filtersData = generateFiltersFromGrants(grantsData);
            }
          } catch (grantsError) {
            // If language-specific file fails, fallback to English
            console.log('Language-specific files failed, falling back to English data');
            const grantsResponse = await axios.get('/data/grants.json');
            grantsData = grantsResponse.data;
            
            const filtersResponse = await axios.get('/data/filters.json');
            filtersData = filtersResponse.data;
          }
          
          console.log('Loaded data from static JSON files');
        }

        setGrants(grantsData);
        setFilters(filtersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    // Helper function to generate filters from grants data
    const generateFiltersFromGrants = (grants) => {
      const filters = {
        organizations: [],
        focusAreas: []
      };

      grants.forEach(grant => {
        // Support both database format and static JSON format
        const organization = grant.funding_organization || grant["Funding Organization"];
        const focusAreas = grant.focus_areas || grant["Focus Areas"];

        // Organizations
        if (organization && !filters.organizations.includes(organization)) {
          filters.organizations.push(organization);
        }

        // Focus Areas - these might be comma-separated
        if (focusAreas) {
          const areas = focusAreas.split(',').map(area => area.trim());
          areas.forEach(area => {
            if (!filters.focusAreas.includes(area)) {
              filters.focusAreas.push(area);
            }
          });
        }
      });

      // Sort filter values alphabetically
      filters.organizations.sort();
      filters.focusAreas.sort();

      return filters;
    };

    fetchData();
  }, []);

  // Initialize search term from URL parameters
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Helper functions
  const extractAmount = (amountString) => {
    const match = amountString.match(/(\d[\d.,]*)/g);
    if (!match) return 0;
    return parseFloat(match[0].replace(/,/g, '')) || 0;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const toggleGrantExpansion = (index) => {
    const newExpanded = new Set(expandedGrants);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGrants(newExpanded);
  };

  const isGrantExpanded = (index) => expandedGrants.has(index);

  // Get organization logo
  const getOrganizationLogo = (organizationName) => {
    if (!organizationName) return null;
    
    // Create slug from organization name
    const slug = organizationName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const logoData = organizationLogos[slug];
    return logoData?.hasLogo ? logoData.logo : null;
  };

  // Sort grants based on criteria
  const sortGrants = useCallback((grantsToSort, sortCriteria) => {
    switch (sortCriteria) {
      case 'nameAsc':
        return [...grantsToSort].sort((a, b) => 
          (a['Grant Name'] || '').localeCompare(b['Grant Name'] || '')
        );
      case 'nameDesc':
        return [...grantsToSort].sort((a, b) => 
          (b['Grant Name'] || '').localeCompare(a['Grant Name'] || '')
        );
      case 'deadlineAsc':
        return [...grantsToSort].sort((a, b) => {
          const dateA = new Date(a['Application Deadline'] || '9999-12-31');
          const dateB = new Date(b['Application Deadline'] || '9999-12-31');
          return dateA - dateB;
        });
      case 'deadlineDesc':
        return [...grantsToSort].sort((a, b) => {
          const dateA = new Date(a['Application Deadline'] || '0000-01-01');
          const dateB = new Date(b['Application Deadline'] || '0000-01-01');
          return dateB - dateA;
        });
      case 'amountAsc':
      case 'amountDesc':
        return [...grantsToSort].sort((a, b) => {
          const amountA = extractAmount(a['Grant Amount'] || '');
          const amountB = extractAmount(b['Grant Amount'] || '');
          return sortCriteria === 'amountAsc' ? amountA - amountB : amountB - amountA;
        });
      default:
        return grantsToSort;
    }
  }, []);

  // Apply filters function
  const applyFilters = useCallback(() => {
    let filtered = [...grants];

    // Text search - support both data formats
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        grant => {
          const grantName = grant.grant_name || grant["Grant Name"] || '';
          const organization = grant.funding_organization || grant["Funding Organization"] || '';
          const focusAreas = grant.focus_areas || grant["Focus Areas"] || '';
          const eligibility = grant.eligibility_criteria || grant["Eligibility Criteria"] || '';
          
          return grantName.toLowerCase().includes(term) ||
                 organization.toLowerCase().includes(term) ||
                 focusAreas.toLowerCase().includes(term) ||
                 eligibility.toLowerCase().includes(term);
        }
      );
    }

    // Organization filter
    if (selectedOrganization) {
      filtered = filtered.filter(grant => {
        const organization = grant.funding_organization || grant["Funding Organization"];
        return organization === selectedOrganization;
      });
    }

    // Focus area filter
    if (selectedFocusArea) {
      filtered = filtered.filter(grant => {
        const focusAreas = grant.focus_areas || grant["Focus Areas"] || '';
        return focusAreas.toLowerCase().includes(selectedFocusArea.toLowerCase());
      });
    }

    // Filter out expired grants unless showExpired is true
    if (!showExpired) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      
      filtered = filtered.filter(grant => {
        const deadlineField = grant.application_deadline || grant["Application Deadline"];
        if (!deadlineField) return true; // Keep grants without deadlines
        
        const deadline = new Date(deadlineField);
        if (isNaN(deadline.getTime())) return true; // Keep grants with invalid dates
        
        return deadline >= today; // Only show grants with deadlines today or in the future
      });
    }

    // Apply sorting
    filtered = sortGrants(filtered, sortBy);

    setFilteredGrants(filtered);
  }, [grants, searchTerm, selectedOrganization, selectedFocusArea, sortBy, showExpired, sortGrants]);

  // Apply filters when data is loaded or filters change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [loading, applyFilters]);

  // Form handlers
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    setSearchParams(params);
    
    applyFilters();
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrganization('');
    setSelectedFocusArea('');
    setSortBy('deadlineAsc');
    setShowExpired(false);
    setSearchParams({});
  };

  // Calculate days until deadline
  const calculateDaysRemaining = (deadlineString) => {
    if (!deadlineString) return null;
    const today = new Date();
    const deadline = new Date(deadlineString);
    if (isNaN(deadline.getTime())) return null;
    return Math.round((deadline - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`grants-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
          {t('grants.search')}
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('grants.subtitle', 'Find the perfect grant opportunity for your organization')}
        </p>
      </div>

      {/* Simplified Filter Bar */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50' : 'bg-white/80 backdrop-blur border border-gray-200/50'} transition-all duration-300`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base`}
              placeholder={t('grants.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className={`absolute left-3 top-3.5 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Organization Filter */}
          <select
            className={`w-full px-4 py-3.5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base appearance-none cursor-pointer`}
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
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
            onChange={(e) => setSelectedFocusArea(e.target.value)}
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
            className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-medium transition-all duration-200 ${darkMode 
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} ${!searchTerm && !selectedOrganization && !selectedFocusArea ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!searchTerm && !selectedOrganization && !selectedFocusArea}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
            </div>
            <label className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}>
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
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
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadlineAsc">{t('grants.sortOptions.deadlineAsc', 'Deadline (Soonest)')}</option>
              <option value="deadlineDesc">{t('grants.sortOptions.deadlineDesc', 'Deadline (Latest)')}</option>
              <option value="amountDesc">{t('grants.sortOptions.amountDesc', 'Amount (Highest)')}</option>
              <option value="amountAsc">{t('grants.sortOptions.amountAsc', 'Amount (Lowest)')}</option>
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
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0s'}}></div>
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                <div className={`w-2 h-8 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : (
            <>
              {filteredGrants.length === 0 ? (
                <div className={`p-12 rounded-2xl text-center ${darkMode ? 'bg-gray-800/50 backdrop-blur' : 'bg-gray-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('grants.noResults')}</p>
                  <p className={`mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGrants.map((grant, index) => {
                    const deadline = grant.application_deadline || grant["Application Deadline"];
                    const daysDiff = calculateDaysRemaining(deadline);
                    const isExpired = daysDiff !== null && daysDiff < 0;
                    const isUrgent = daysDiff !== null && daysDiff >= 0 && daysDiff <= 7;
                                        
                    return (
                      <div 
                        key={index} 
                        className={`rounded-2xl overflow-hidden ${
                          isExpired 
                            ? (darkMode ? 'bg-gray-800/50 border border-red-700/30 opacity-60' : 'bg-gray-50 border border-red-200 opacity-75')
                            : (darkMode ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50 hover:shadow-xl hover:border-gray-600/50' 
                              : 'bg-white/80 backdrop-blur border border-gray-200/50 hover:shadow-xl')
                        } transition-all duration-300`}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start space-x-4 flex-1">
                              {getOrganizationLogo(grant.funding_organization || grant["Funding Organization"]) && (
                                <div className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} p-2`}>
                                  <img 
                                    src={getOrganizationLogo(grant.funding_organization || grant["Funding Organization"])}
                                    alt={`${grant.funding_organization || grant["Funding Organization"]} logo`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h2 className={`text-xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {getLocalizedField(grant, 'grant_name') || getLocalizedField(grant, 'Grant Name')}
                                </h2>
                                <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {getLocalizedField(grant, 'funding_organization') || getLocalizedField(grant, 'Funding Organization')}
                                </p>
                              </div>
                            </div>
                            {/* Status Badge moved to top right */}
                            <div className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                              isExpired 
                                ? (darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600')
                                : isUrgent 
                                  ? (darkMode ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-600') 
                                  : (darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600')
                            }`}>
                              {isExpired ? 'EXPIRED' : isUrgent ? `${daysDiff} DAYS LEFT` : 'OPEN'}
                            </div>
                          </div>
                          {/* Key Information Pills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              {getLocalizedField(grant, 'grant_amount') || getLocalizedField(grant, 'Grant Amount') || 'Amount varies'}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {formatDate(grant.application_deadline || grant["Application Deadline"])}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {getLocalizedField(grant, 'duration') || getLocalizedField(grant, 'Duration') || 'Varies'}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {getLocalizedField(grant, 'country_region') || getLocalizedField(grant, 'Country/Region')}
                            </div>
                          </div>
                          
                          {/* Focus Areas - Simplified */}
                          <div className="mb-4">
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-sm`}>
                              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('grants.focusArea')}:</span> {truncateText(getLocalizedField(grant, 'focus_areas') || getLocalizedField(grant, 'Focus Areas'), 150)}
                            </p>
                          </div>
                          
                          {/* Eligibility - Simplified */}
                          <div className="mb-4">
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-sm`}>
                              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('grants.eligibility')}:</span> {truncateText(getLocalizedField(grant, 'eligibility_criteria') || getLocalizedField(grant, 'Eligibility Criteria'), 200)}
                            </p>
                          </div>
                          
                          {/* Enhanced Details Section - Only show if grant is expanded */}
                          {isGrantExpanded(index) && (
                            <div className="space-y-4 mt-6">
                              
                              {/* Detailed Description */}
                              {(getLocalizedField(grant, 'detailed_description')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Description</h3>
                                  <div className={`${darkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>
                                      {getLocalizedField(grant, 'detailed_description')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Application Procedure */}
                              {(getLocalizedField(grant, 'application_procedure')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Application Procedure</h3>
                                  <div className={`${darkMode ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-purple-200' : 'text-purple-800'} leading-relaxed whitespace-pre-line`}>
                                      {getLocalizedField(grant, 'application_procedure')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Required Documents */}
                              {(getLocalizedField(grant, 'required_documents')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Required Documents</h3>
                                  <div className={`${darkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} leading-relaxed whitespace-pre-line`}>
                                      {getLocalizedField(grant, 'required_documents')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Evaluation Criteria */}
                              {(getLocalizedField(grant, 'evaluation_criteria')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Evaluation Criteria</h3>
                                  <div className={`${darkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-green-200' : 'text-green-800'} leading-relaxed whitespace-pre-line`}>
                                      {getLocalizedField(grant, 'evaluation_criteria')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Additional Requirements */}
                              {(getLocalizedField(grant, 'additional_requirements')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Additional Requirements</h3>
                                  <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} leading-relaxed whitespace-pre-line`}>
                                      {getLocalizedField(grant, 'additional_requirements')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Reporting Requirements */}
                              {(getLocalizedField(grant, 'reporting_requirements')) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Reporting Requirements</h3>
                                  <div className={`${darkMode ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200'} p-4 rounded-lg border`}>
                                    <p className={`${darkMode ? 'text-orange-200' : 'text-orange-800'} leading-relaxed whitespace-pre-line`}>
                                      {getLocalizedField(grant, 'reporting_requirements')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Contact Information */}
                              {(grant.contact_email || grant.contact_person || grant.contact_phone) && (
                                <div className="mb-4">
                                  <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>Contact Information</h3>
                                  <div className={`${darkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} p-4 rounded-lg border`}>
                                    <div className="space-y-2">
                                      {grant.contact_person && (
                                        <div className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                          </svg>
                                          <span className={`${darkMode ? 'text-indigo-200' : 'text-indigo-800'} font-medium`}>
                                            {grant.contact_person}
                                          </span>
                                        </div>
                                      )}
                                      {grant.contact_email && (
                                        <div className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                          </svg>
                                          <a 
                                            href={`mailto:${grant.contact_email}`}
                                            className={`${darkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-700 hover:text-indigo-800'} hover:underline`}
                                          >
                                            {grant.contact_email}
                                          </a>
                                        </div>
                                      )}
                                      {grant.contact_phone && (
                                        <div className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                          </svg>
                                          <span className={`${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                                            {grant.contact_phone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action Section - Simplified */}
                          <div className="flex justify-end items-center gap-3 mt-6">
                            <button
                              onClick={() => toggleGrantExpansion(index)}
                              className={`text-sm font-medium transition-all duration-200 ${darkMode 
                                ? 'text-gray-400 hover:text-gray-200' 
                                : 'text-gray-600 hover:text-gray-900'}`}
                            >
                              {isGrantExpanded(index) ? 'Show less' : 'View details'}
                            </button>
                              {(grant.website_link || grant["Website Link"]) && (
                                <a 
                                  href={(() => {
                                    // Extract URL from the Website Link field which may contain label:url format
                                    const link = grant.website_link || grant["Website Link"];
                                    const urlPart = link.includes(':http') ? link.substring(link.indexOf(':http') + 1) : link;
                                    return urlPart.startsWith('http') ? urlPart : `https://${urlPart}`;
                                  })()} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center rounded-xl py-2.5 px-5 font-medium transition-all duration-200 ${darkMode 
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'} shadow-sm hover:shadow-md`}
                                >
                                  {t('grants.applyNow')}
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                        </div>
                      </div>
                    );
                  })}
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

export default GrantsPage;
