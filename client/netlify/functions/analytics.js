const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create analytics tables if they don't exist
async function ensureAnalyticsTables() {
  try {
    // Create events table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS analytics_events (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          session_id VARCHAR(50),
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          data JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type);
        CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
        
        CREATE TABLE IF NOT EXISTS grant_analytics (
          grant_id INTEGER PRIMARY KEY,
          view_count INTEGER DEFAULT 0,
          last_viewed TIMESTAMPTZ,
          search_appearances INTEGER DEFAULT 0,
          click_through_rate DECIMAL(5,2),
          average_time_on_page INTEGER,
          external_clicks INTEGER DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS search_analytics (
          id SERIAL PRIMARY KEY,
          query TEXT,
          results_count INTEGER,
          clicked_result BOOLEAN DEFAULT FALSE,
          session_id VARCHAR(50),
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_search_query ON search_analytics(query);
        CREATE INDEX IF NOT EXISTS idx_search_timestamp ON search_analytics(timestamp);
      `
    });
  } catch (error) {
    console.error('Error creating analytics tables:', error);
  }
}

// Handler function
exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  try {
    // Ensure tables exist
    await ensureAnalyticsTables();

    if (event.httpMethod === 'POST') {
      // Store analytics events
      const { events } = JSON.parse(event.body);
      
      if (!Array.isArray(events)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Events must be an array' })
        };
      }

      // Process each event
      for (const evt of events) {
        const { type, sessionId, timestamp, ...data } = evt;
        
        // Store event
        await supabase
          .from('analytics_events')
          .insert({
            type,
            session_id: sessionId,
            timestamp,
            data
          });

        // Update specific analytics based on event type
        switch (type) {
          case 'grant_view':
            await updateGrantAnalytics(data.grantId, 'view');
            break;
          case 'search':
            await recordSearchAnalytics(data.query, data.resultsCount, sessionId);
            break;
          case 'external_link_click':
            if (data.grantId) {
              await updateGrantAnalytics(data.grantId, 'external_click');
            }
            break;
        }
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, processed: events.length })
      };
    }

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const action = params.action;

      switch (action) {
        case 'summary':
          const summary = await getAnalyticsSummary();
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(summary)
          };

        case 'popular':
          const limit = parseInt(params.limit) || 10;
          const popular = await getPopularGrants(limit);
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(popular)
          };

        case 'searchTrends':
          const days = parseInt(params.days) || 7;
          const trends = await getSearchTrends(days);
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trends)
          };

        case 'grantStats':
          const grantId = params.grantId;
          if (!grantId) {
            return {
              statusCode: 400,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Grant ID required' })
            };
          }
          const stats = await getGrantStats(grantId);
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stats)
          };

        default:
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid action' })
          };
      }
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Update grant analytics
async function updateGrantAnalytics(grantId, action) {
  try {
    const { data: existing } = await supabase
      .from('grant_analytics')
      .select('*')
      .eq('grant_id', grantId)
      .single();

    if (existing) {
      const updates = {
        updated_at: new Date().toISOString()
      };

      if (action === 'view') {
        updates.view_count = (existing.view_count || 0) + 1;
        updates.last_viewed = new Date().toISOString();
      } else if (action === 'external_click') {
        updates.external_clicks = (existing.external_clicks || 0) + 1;
      }

      await supabase
        .from('grant_analytics')
        .update(updates)
        .eq('grant_id', grantId);
    } else {
      const newRecord = {
        grant_id: grantId,
        view_count: action === 'view' ? 1 : 0,
        external_clicks: action === 'external_click' ? 1 : 0,
        last_viewed: action === 'view' ? new Date().toISOString() : null
      };

      await supabase
        .from('grant_analytics')
        .insert(newRecord);
    }

    // Also update the main grants table view count
    if (action === 'view') {
      await supabase.rpc('increment_grant_view', { grant_id: grantId });
    }
  } catch (error) {
    console.error('Error updating grant analytics:', error);
  }
}

// Record search analytics
async function recordSearchAnalytics(query, resultsCount, sessionId) {
  try {
    await supabase
      .from('search_analytics')
      .insert({
        query: query.substring(0, 200), // Limit query length
        results_count: resultsCount,
        session_id: sessionId
      });
  } catch (error) {
    console.error('Error recording search analytics:', error);
  }
}

// Get analytics summary
async function getAnalyticsSummary() {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total events
    const { count: totalEvents } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });

    // Events last 30 days
    const { count: events30Days } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', last30Days.toISOString());

    // Events last 7 days
    const { count: events7Days } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', last7Days.toISOString());

    // Unique sessions last 30 days
    const { data: sessions30Days } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('timestamp', last30Days.toISOString());
    
    const uniqueSessions30Days = new Set(sessions30Days?.map(s => s.session_id) || []).size;

    // Popular event types
    const { data: eventTypes } = await supabase
      .from('analytics_events')
      .select('type')
      .gte('timestamp', last30Days.toISOString());
    
    const eventTypeCounts = {};
    eventTypes?.forEach(e => {
      eventTypeCounts[e.type] = (eventTypeCounts[e.type] || 0) + 1;
    });

    // Total grant views
    const { data: grantViews } = await supabase
      .from('grant_analytics')
      .select('view_count');
    
    const totalGrantViews = grantViews?.reduce((sum, g) => sum + (g.view_count || 0), 0) || 0;

    // Total searches
    const { count: totalSearches } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact', head: true });

    return {
      summary: {
        totalEvents,
        events30Days,
        events7Days,
        uniqueSessions30Days,
        totalGrantViews,
        totalSearches
      },
      eventTypes: eventTypeCounts,
      trends: {
        eventsGrowth: events30Days > 0 ? ((events7Days / 7) / (events30Days / 30) - 1) * 100 : 0
      }
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return null;
  }
}

// Get popular grants
async function getPopularGrants(limit) {
  try {
    const { data: analytics } = await supabase
      .from('grant_analytics')
      .select('grant_id, view_count, last_viewed')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (!analytics || analytics.length === 0) {
      return [];
    }

    // Get grant details
    const grantIds = analytics.map(a => a.grant_id);
    const { data: grants } = await supabase
      .from('grants')
      .select('id, grant_name, funding_organization, focus_areas, application_deadline')
      .in('id', grantIds);

    // Combine analytics with grant data
    const popularGrants = analytics.map(a => {
      const grant = grants?.find(g => g.id === a.grant_id);
      return {
        ...grant,
        view_count: a.view_count,
        last_viewed: a.last_viewed
      };
    }).filter(g => g.grant_name); // Filter out any missing grants

    return popularGrants;
  } catch (error) {
    console.error('Error getting popular grants:', error);
    return [];
  }
}

// Get search trends
async function getSearchTrends(days) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: searches } = await supabase
      .from('search_analytics')
      .select('query')
      .gte('timestamp', since.toISOString());

    if (!searches || searches.length === 0) {
      return [];
    }

    // Count query frequency
    const queryCounts = {};
    searches.forEach(s => {
      const query = s.query.toLowerCase().trim();
      if (query) {
        queryCounts[query] = (queryCounts[query] || 0) + 1;
      }
    });

    // Sort by frequency and return top trends
    const trends = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return trends;
  } catch (error) {
    console.error('Error getting search trends:', error);
    return [];
  }
}

// Get grant-specific stats
async function getGrantStats(grantId) {
  try {
    const { data: analytics } = await supabase
      .from('grant_analytics')
      .select('*')
      .eq('grant_id', grantId)
      .single();

    const { data: recentViews } = await supabase
      .from('analytics_events')
      .select('timestamp')
      .eq('type', 'grant_view')
      .eq('data->>grantId', grantId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    return {
      ...analytics,
      recentViews: recentViews?.length || 0,
      viewsLast30Days: recentViews?.length || 0,
      viewTimeline: generateViewTimeline(recentViews || [])
    };
  } catch (error) {
    console.error('Error getting grant stats:', error);
    return null;
  }
}

// Generate view timeline for charts
function generateViewTimeline(views) {
  const timeline = {};
  const now = new Date();
  
  // Initialize last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    timeline[key] = 0;
  }

  // Count views per day
  views.forEach(v => {
    const date = v.timestamp.split('T')[0];
    if (timeline.hasOwnProperty(date)) {
      timeline[date]++;
    }
  });

  return Object.entries(timeline)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}