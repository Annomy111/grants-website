import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log for debugging
console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helper functions
export const auth = {
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }
};

// Database helper functions
export const db = {
  // Grants
  getGrants: async (filters = {}) => {
    let query = supabase
      .from('grants')
      .select('*')
      .eq('status', 'active');

    if (filters.search) {
      query = query.or(`grant_name.ilike.%${filters.search}%,funding_organization.ilike.%${filters.search}%,focus_areas.ilike.%${filters.search}%`);
    }

    if (filters.organization) {
      query = query.eq('funding_organization', filters.organization);
    }

    if (filters.country) {
      query = query.eq('country_region', filters.country);
    }

    if (filters.focusArea) {
      query = query.ilike('focus_areas', `%${filters.focusArea}%`);
    }

    const { data, error } = await query.order('application_deadline', { ascending: true });
    return { data, error };
  },

  getGrant: async (id) => {
    const { data, error } = await supabase
      .from('grants')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();
    return { data, error };
  },

  getFilters: async () => {
    const { data: grants, error } = await supabase
      .from('grants')
      .select('funding_organization, country_region, focus_areas')
      .eq('status', 'active');

    if (error) return { data: null, error };

    const organizations = [...new Set(grants.map(g => g.funding_organization).filter(Boolean))].sort();
    const countries = [...new Set(grants.map(g => g.country_region).filter(Boolean))].sort();
    const focusAreas = [...new Set(
      grants.flatMap(g => 
        g.focus_areas ? g.focus_areas.split(',').map(area => area.trim()) : []
      ).filter(Boolean)
    )].sort();

    return {
      data: {
        organizations,
        countries,
        focusAreas
      },
      error: null
    };
  },

  // Admin functions
  createGrant: async (grantData) => {
    const { data, error } = await supabase
      .from('grants')
      .insert(grantData)
      .select()
      .single();
    return { data, error };
  },

  updateGrant: async (id, grantData) => {
    const { data, error } = await supabase
      .from('grants')
      .update(grantData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteGrant: async (id) => {
    const { error } = await supabase
      .from('grants')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Chat functions
  createChatSession: async (sessionData = {}) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        session_data: sessionData
      })
      .select()
      .single();
    return { data, error };
  },

  getChatHistory: async (sessionId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToChatMessages: (sessionId, callback) => {
    return supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToGrants: (callback) => {
    return supabase
      .channel('grants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grants'
        },
        callback
      )
      .subscribe();
  }
};

export default supabase;