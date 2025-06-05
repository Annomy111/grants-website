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
    countries: [],
    focusAreas: []
  });

  // Form state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
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
        countries: [],
        focusAreas: []
      };

      grants.forEach(grant => {
        // Support both database format and static JSON format
        const organization = grant.funding_organization || grant["Funding Organization"];
        const country = grant.country_region || grant["Country/Region"];
        const focusAreas = grant.focus_areas || grant["Focus Areas"];

        // Organizations
        if (organization && !filters.organizations.includes(organization)) {
          filters.organizations.push(organization);
        }

        // Countries
        if (country && !filters.countries.includes(country)) {
          filters.countries.push(country);
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
      filters.countries.sort();
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

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(grant => {
        const country = grant.country_region || grant["Country/Region"];
        return country === selectedCountry;
      });
    }

    // Focus area filter
    if (selectedFocusArea) {
      filtered = filtered.filter(grant => {
        const focusAreas = grant.focus_areas || grant["Focus Areas"] || '';
        return focusAreas.toLowerCase().includes(selectedFocusArea.toLowerCase());
      });
    }

    // Grant amount filter
    if (minAmount || maxAmount) {
      filtered = filtered.filter(grant => {
        // Extract numbers from the grant amount field
        const amountText = grant.grant_amount || grant["Grant Amount"] || '';
        const amountMatch = amountText.match(/(\d[\d.,]*)/g);
        
        if (!amountMatch) return false;
        
        // Parse the first number found
        const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
        
        if (isNaN(amount)) return false;
        
        if (minAmount && amount < parseFloat(minAmount)) return false;
        if (maxAmount && amount > parseFloat(maxAmount)) return false;
        
        return true;
      });
    }

    // Deadline filter
    if (deadlineDate) {
      const filterDate = new Date(deadlineDate);
      
      filtered = filtered.filter(grant => {
        const deadline = grant.application_deadline || grant["Application Deadline"];
        if (!deadline) return false;
        
        const grantDeadline = new Date(deadline);
        
        if (isNaN(grantDeadline.getTime())) return false;
        
        return grantDeadline >= filterDate;
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
  }, [grants, searchTerm, selectedOrganization, selectedCountry, selectedFocusArea, minAmount, maxAmount, deadlineDate, sortBy, showExpired, sortGrants]);

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
    setSelectedCountry('');
    setSelectedFocusArea('');
    setMinAmount('');
    setMaxAmount('');
    setDeadlineDate('');
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
    <div className={`grants-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8`}>
      <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{t('grants.search')}</h1>
      
      <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium mb-8 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <span>{t('grants.resultsCount', { count: filteredGrants.length })}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl shadow-md p-6 sticky top-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} transition-colors duration-300`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{t('grants.filters')}</h2>
            
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label htmlFor="search" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className={`w-full p-3 pr-10 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                    placeholder={t('grants.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="organization" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.organization')}
                </label>
                <select
                  id="organization"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                >
                  <option value="">{`-- ${t('grants.organization')} --`}</option>
                  {filters.organizations.map((org, index) => (
                    <option key={index} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="country" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.country')}
                </label>
                <select
                  id="country"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">{`-- ${t('grants.country')} --`}</option>
                  {filters.countries.map((country, index) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="focusArea" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.focusArea')}
                </label>
                <select
                  id="focusArea"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={selectedFocusArea}
                  onChange={(e) => setSelectedFocusArea(e.target.value)}
                >
                  <option value="">{`-- ${t('grants.focusArea')} --`}</option>
                  {filters.focusAreas.map((area, index) => (
                    <option key={index} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.filterByAmount')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                    placeholder={t('grants.minAmount')}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                  <input
                    type="number"
                    className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                    placeholder={t('grants.maxAmount')}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="deadline" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.filterByDeadline')}
                </label>
                <input
                  type="date"
                  id="deadline"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className={`flex items-center space-x-2 cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    checked={showExpired}
                    onChange={(e) => setShowExpired(e.target.checked)}
                  />
                  <span className="text-sm font-medium">Show expired grants</span>
                </label>
              </div>
              
              <div className="mb-6">
                <label htmlFor="sortBy" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                  {t('grants.sortBy')}
                </label>
                <select
                  id="sortBy"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="nameAsc">{t('grants.sortOptions.nameAsc')}</option>
                  <option value="nameDesc">{t('grants.sortOptions.nameDesc')}</option>
                  <option value="deadlineAsc">{t('grants.sortOptions.deadlineAsc')}</option>
                  <option value="deadlineDesc">{t('grants.sortOptions.deadlineDesc')}</option>
                  <option value="amountAsc">{t('grants.sortOptions.amountAsc')}</option>
                  <option value="amountDesc">{t('grants.sortOptions.amountDesc')}</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  type="submit" 
                  className={`flex items-center justify-center py-2.5 px-4 rounded-lg font-medium transition duration-200 flex-1 ${darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  {t('grants.search')}
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`py-2.5 px-4 rounded-lg font-medium transition duration-200 ${darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  {t('grants.resetFilters')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Grants List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className={`relative h-16 w-16`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
                <div className={`absolute top-0 left-0 animate-ping h-16 w-16 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} opacity-20`}></div>
              </div>
            </div>
          ) : (
            <>
              {filteredGrants.length === 0 ? (
                <div className={`p-8 rounded-xl text-center ${darkMode ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-blue-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">{t('grants.noResults')}</p>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredGrants.map((grant, index) => {
                    const deadline = grant.application_deadline || grant["Application Deadline"];
                    const daysDiff = calculateDaysRemaining(deadline);
                    const isExpired = daysDiff !== null && daysDiff < 0;
                    const isUrgent = daysDiff !== null && daysDiff >= 0 && daysDiff <= 7;
                                        
                    return (
                      <div 
                        key={index} 
                        className={`rounded-xl shadow-md overflow-hidden ${
                          isExpired 
                            ? (darkMode ? 'bg-gray-800 border border-red-700 opacity-60' : 'bg-gray-50 border border-red-200 opacity-75')
                            : (darkMode ? 'bg-gray-800 border border-gray-700 hover:shadow-lg hover:border-gray-600' 
                              : 'bg-white border border-gray-200 hover:shadow-lg')
                        } transition-all duration-200`}
                      >
                        <div className={`px-6 py-5 border-b ${darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-4 flex-1">
                              {getOrganizationLogo(grant.funding_organization || grant["Funding Organization"]) && (
                                <div className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-white/80'} p-2`}>
                                  <img 
                                    src={getOrganizationLogo(grant.funding_organization || grant["Funding Organization"])}
                                    alt={`${grant.funding_organization || grant["Funding Organization"]} logo`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                                  {getLocalizedField(grant, 'grant_name') || getLocalizedField(grant, 'Grant Name')}
                                </h2>
                                <p className={`text-lg font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                  {getLocalizedField(grant, 'funding_organization') || getLocalizedField(grant, 'Funding Organization')}
                                </p>
                              </div>
                            </div>
                            <div className={`text-right ml-4 ${isExpired ? 'opacity-60' : ''}`}>
                              <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {getLocalizedField(grant, 'grant_amount') || getLocalizedField(grant, 'Grant Amount') || 'Amount varies'}
                              </div>
                              <div className={`text-sm font-medium mt-1 ${
                                isExpired 
                                  ? (darkMode ? 'text-red-400' : 'text-red-600')
                                  : isUrgent 
                                    ? (darkMode ? 'text-orange-400' : 'text-orange-600') 
                                    : (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                              }`}>
                                {formatDate(grant.application_deadline || grant["Application Deadline"])}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          {/* Key Information Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h3 className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('grants.amount')}</h3>
                              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-bold text-sm`}>
                                {getLocalizedField(grant, 'grant_amount') || getLocalizedField(grant, 'Grant Amount') || 'Not specified'}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h3 className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('grants.deadline')}</h3>
                              <p className={`font-bold text-sm ${
                                isExpired 
                                  ? (darkMode ? 'text-red-400' : 'text-red-600')
                                  : isUrgent 
                                    ? (darkMode ? 'text-orange-400' : 'text-orange-600') 
                                    : (darkMode ? 'text-gray-200' : 'text-gray-800')
                              }`}>
                                {formatDate(grant.application_deadline || grant["Application Deadline"])}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h3 className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('grants.duration')}</h3>
                              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium text-sm`}>
                                {getLocalizedField(grant, 'duration') || getLocalizedField(grant, 'Duration') || 'Varies'}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h3 className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{t('grants.country')}</h3>
                              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium text-sm`}>
                                {getLocalizedField(grant, 'country_region') || getLocalizedField(grant, 'Country/Region')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Focus Areas Section */}
                          <div className="mb-4">
                            <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>{t('grants.focusArea')}</h3>
                            <div className={`${darkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'} p-4 rounded-lg border`}>
                              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                                {isGrantExpanded(index) 
                                  ? (getLocalizedField(grant, 'focus_areas') || getLocalizedField(grant, 'Focus Areas'))
                                  : truncateText(getLocalizedField(grant, 'focus_areas') || getLocalizedField(grant, 'Focus Areas'), 300)
                                }
                              </p>
                              {(grant.focus_areas || grant["Focus Areas"])?.length > 300 && (
                                <button
                                  onClick={() => toggleGrantExpansion(index)}
                                  className={`text-sm mt-2 font-medium hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                  {isGrantExpanded(index) ? 'Show less' : 'Show full focus areas'}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                            isExpired 
                              ? (darkMode ? 'bg-red-900/20 text-red-400 border border-red-700/30' : 'bg-red-50 text-red-600 border border-red-200')
                              : isUrgent 
                                ? (darkMode ? 'bg-orange-900/20 text-orange-400 border border-orange-700/30' : 'bg-orange-50 text-orange-600 border border-orange-200') 
                                : (darkMode ? 'bg-green-900/20 text-green-400 border border-green-700/30' : 'bg-green-50 text-green-600 border border-green-200')
                          }`}>
                            {isExpired ? 'EXPIRED' : isUrgent ? (daysDiff <= 0 ? 'DUE TODAY!' : `${daysDiff} DAYS LEFT`) : 'OPEN'}
                          </div>
                          
                          <div className="mb-4">
                            <h3 className={`font-semibold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>{t('grants.eligibility')}</h3>
                            <div className={`${darkMode ? 'bg-gray-750 border-gray-600' : 'bg-blue-50 border-blue-200'} p-4 rounded-lg border`}>
                              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>
                                {isGrantExpanded(index) 
                                  ? (getLocalizedField(grant, 'eligibility_criteria') || getLocalizedField(grant, 'Eligibility Criteria'))
                                  : truncateText(getLocalizedField(grant, 'eligibility_criteria') || getLocalizedField(grant, 'Eligibility Criteria'), 400)
                                }
                              </p>
                              {(grant.eligibility_criteria || grant["Eligibility Criteria"])?.length > 400 && (
                                <button
                                  onClick={() => toggleGrantExpansion(index)}
                                  className={`text-sm mt-2 font-medium hover:underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                  {isGrantExpanded(index) ? 'Show less details' : 'Show full details'}
                                </button>
                              )}
                            </div>
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
                          
                          {/* Action Section */}
                          <div className={`flex justify-between items-center flex-wrap gap-3 border-t pt-4 mt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center space-x-4">
                              {isGrantExpanded(index) && (
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                  Detailed view
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => toggleGrantExpansion(index)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 border border-gray-300'}`}
                              >
                                {isGrantExpanded(index) ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    View Details
                                  </>
                                )}
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
                                  className={`flex items-center rounded-lg py-2 px-4 font-medium transition-all duration-200 ${darkMode 
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'}`}
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
