import axios from 'axios';

// Helper function to get the correct auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Helper function to normalize grant field names
export const normalizeGrant = (grant) => {
  // Handle both database format (snake_case) and JSON format (Title Case)
  return {
    id: grant.id || grant.ID,
    name: grant.name || grant.grant_name || grant['Grant Name'],
    organization: grant.organization || grant['Organization'],
    deadline: grant.deadline || grant['Deadline'],
    grant_size_min: grant.grant_size_min || grant['Grant Size Min'] || 0,
    grant_size_max: grant.grant_size_max || grant['Grant Size Max'] || 0,
    type: grant.type || grant['Type'],
    geographic_focus: grant.geographic_focus || grant['Geographic Focus'],
    description_en: grant.description_en || grant['Description (EN)'],
    description_uk: grant.description_uk || grant['Description (UK)'],
    eligibility_en: grant.eligibility_en || grant['Eligibility (EN)'],
    eligibility_uk: grant.eligibility_uk || grant['Eligibility (UK)'],
    focus_areas_en: grant.focus_areas_en || grant['Focus Areas (EN)'],
    focus_areas_uk: grant.focus_areas_uk || grant['Focus Areas (UK)'],
    website: grant.website || grant['Website'],
    application_url: grant.application_url || grant['Application URL'],
    logo_url: grant.logo_url || grant['Logo URL'],
    status: grant.status || 'active'
  };
};

// Fetch grants for admin panel with proper auth and fallback
export const fetchGrantsForAdmin = async () => {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Try API first
    const response = await axios.get('/api/grants', { headers });
    
    if (response.data) {
      // Handle both array and object response formats
      let grants = [];
      if (Array.isArray(response.data)) {
        grants = response.data;
      } else if (response.data.grants) {
        grants = response.data.grants;
      } else if (response.data.data) {
        grants = response.data.data;
      }
      
      // Normalize all grants
      return grants.map(normalizeGrant);
    }
    
    throw new Error('No data in response');
  } catch (error) {
    console.error('Error fetching grants from API, trying static data:', error);
    
    // Fallback to static JSON
    try {
      const response = await axios.get('/data/grants.json');
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(normalizeGrant);
      }
    } catch (staticError) {
      console.error('Error fetching static grants:', staticError);
    }
    
    return [];
  }
};

// Fetch blog posts for admin panel with proper response handling
export const fetchBlogPostsForAdmin = async () => {
  try {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get('/.netlify/functions/blog', { headers });
    
    if (response.data) {
      // Handle wrapped response format
      if (response.data.posts !== undefined) {
        return response.data.posts || [];
      }
      // Handle direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Handle object with success property
      if (response.data.success && response.data.posts) {
        return response.data.posts;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

// Calculate dashboard statistics
export const calculateDashboardStats = (grants, blogPosts) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Count upcoming deadlines (within 30 days)
  const upcomingDeadlines = grants.filter(grant => {
    if (!grant.deadline) return false;
    
    try {
      const deadline = new Date(grant.deadline);
      return !isNaN(deadline) && deadline >= now && deadline <= thirtyDaysFromNow;
    } catch {
      return false;
    }
  }).length;
  
  // Count published blog posts
  const publishedPosts = blogPosts.filter(post => 
    post.status === 'published' || post.published_at
  ).length;
  
  return {
    totalGrants: grants.length,
    upcomingDeadlines,
    totalBlogPosts: blogPosts.length,
    publishedPosts
  };
};