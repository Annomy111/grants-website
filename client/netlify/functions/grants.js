import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server functions
);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/grants', '');
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};

    // Route: GET /grants
    if (method === 'GET' && path === '') {
      return await getGrants(queryParams, headers);
    }

    // Route: GET /grants/filters  
    if (method === 'GET' && path === '/filters') {
      return await getFilters(headers);
    }

    // Route: GET /grants/:id
    if (method === 'GET' && path.match(/^\/\d+$/)) {
      const id = path.substring(1);
      return await getGrant(id, headers);
    }

    // Route: POST /grants (admin only)
    if (method === 'POST' && path === '') {
      return await createGrant(JSON.parse(event.body), headers, event);
    }

    // Route: PUT /grants/:id (admin only)
    if (method === 'PUT' && path.match(/^\/\d+$/)) {
      const id = path.substring(1);
      return await updateGrant(id, JSON.parse(event.body), headers, event);
    }

    // Route: DELETE /grants/:id (admin only)
    if (method === 'DELETE' && path.match(/^\/\d+$/)) {
      const id = path.substring(1);
      return await deleteGrant(id, headers, event);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};

async function getGrants(params, headers) {
  let query = supabase
    .from('grants')
    .select('*')
    .eq('status', 'active');

  // Apply filters
  if (params.query) {
    const searchTerm = `%${params.query}%`;
    query = query.or(`grant_name.ilike.${searchTerm},funding_organization.ilike.${searchTerm},focus_areas.ilike.${searchTerm},eligibility_criteria.ilike.${searchTerm}`);
  }

  if (params.organization) {
    query = query.eq('funding_organization', params.organization);
  }

  if (params.country) {
    query = query.eq('country_region', params.country);
  }

  if (params.focusArea) {
    query = query.ilike('focus_areas', `%${params.focusArea}%`);
  }

  if (params.deadline) {
    query = query.gte('application_deadline', params.deadline);
  }

  // Apply sorting
  const sortBy = params.sortBy || 'deadlineAsc';
  
  switch (sortBy) {
    case 'nameAsc':
      query = query.order('grant_name', { ascending: true });
      break;
    case 'nameDesc':
      query = query.order('grant_name', { ascending: false });
      break;
    case 'deadlineAsc':
      query = query.order('application_deadline', { ascending: true });
      break;
    case 'deadlineDesc':
      query = query.order('application_deadline', { ascending: false });
      break;
    case 'amountAsc':
      query = query.order('grant_amount', { ascending: true });
      break;
    case 'amountDesc':
      query = query.order('grant_amount', { ascending: false });
      break;
    default:
      query = query.order('application_deadline', { ascending: true });
      break;
  }

  const { data, error } = await query;

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }

  // Track view if not from admin
  if (!params.admin) {
    // Update view counts asynchronously (don't wait)
    data.forEach(grant => {
      supabase
        .from('grants')
        .update({ view_count: grant.view_count + 1 })
        .eq('id', grant.id)
        .then();
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
}

async function getFilters(headers) {
  const { data: grants, error } = await supabase
    .from('grants')
    .select('funding_organization, country_region, focus_areas')
    .eq('status', 'active');

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }

  // Process filters
  const organizations = [...new Set(grants.map(g => g.funding_organization).filter(Boolean))].sort();
  const countries = [...new Set(grants.map(g => g.country_region).filter(Boolean))].sort();
  
  // Process focus areas (comma-separated)
  const focusAreas = [...new Set(
    grants.flatMap(g => 
      g.focus_areas ? g.focus_areas.split(',').map(area => area.trim()) : []
    ).filter(Boolean)
  )].sort();

  const filters = {
    organizations,
    countries,
    focusAreas
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(filters),
  };
}

async function getGrant(id, headers) {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Grant not found' }),
    };
  }

  // Increment view count
  await supabase
    .from('grants')
    .update({ view_count: data.view_count + 1 })
    .eq('id', id);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
}

async function createGrant(data, headers, event) {
  // Basic auth check (in production, implement proper JWT verification)
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const { data: grant, error } = await supabase
    .from('grants')
    .insert({
      grant_name: data.grant_name,
      funding_organization: data.funding_organization,
      country_region: data.country_region,
      eligibility_criteria: data.eligibility_criteria,
      focus_areas: data.focus_areas,
      grant_amount: data.grant_amount,
      application_deadline: data.application_deadline,
      duration: data.duration,
      website_link: data.website_link,
      status: data.status || 'active',
      featured: data.featured || false
    })
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(grant),
  };
}

async function updateGrant(id, data, headers, event) {
  // Basic auth check
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const { data: grant, error } = await supabase
    .from('grants')
    .update({
      grant_name: data.grant_name,
      funding_organization: data.funding_organization,
      country_region: data.country_region,
      eligibility_criteria: data.eligibility_criteria,
      focus_areas: data.focus_areas,
      grant_amount: data.grant_amount,
      application_deadline: data.application_deadline,
      duration: data.duration,
      website_link: data.website_link,
      status: data.status,
      featured: data.featured
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(grant),
  };
}

async function deleteGrant(id, headers, event) {
  // Basic auth check
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const { error } = await supabase
    .from('grants')
    .delete()
    .eq('id', id);

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Grant deleted successfully' }),
  };
}