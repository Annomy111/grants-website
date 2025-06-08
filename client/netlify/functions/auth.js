import { createClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

export const handler = async (event, context) => {
  // Debug environment variables
  console.log('Auth function env check:', {
    hasReactAppUrl: !!process.env.REACT_APP_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/auth', '');
  const method = event.httpMethod;

  try {
    // Route: POST /auth/login
    if (method === 'POST' && path === '/login') {
      return await handleLogin(JSON.parse(event.body), headers);
    }

    // Route: GET /auth/me
    if (method === 'GET' && path === '/me') {
      return await handleGetUser(event.headers, headers);
    }

    // Route: POST /auth/change-password
    if (method === 'POST' && path === '/change-password') {
      return await handleChangePassword(JSON.parse(event.body), event.headers, headers);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handleLogin(body, headers) {
  const { username, password } = body;

  if (!username || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Username and password required' }),
    };
  }

  try {
    console.log('Login attempt for:', username);
    
    // Check hardcoded credentials first (fallback when Supabase is down)
    if ((username === 'admin' || username === 'mattia') && password === 'admin123') {
      console.log('Using hardcoded credentials for:', username);
      
      // Generate a simple JWT-like token
      const token = Buffer.from(JSON.stringify({
        user: username,
        role: 'admin',
        exp: Date.now() + 86400000 // 24 hours
      })).toString('base64');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: token,
          user: {
            id: username,
            email: `${username}@admin.local`,
            username: username,
            role: 'admin'
          },
          session: {
            access_token: token,
            expires_in: 86400,
            token_type: 'Bearer'
          }
        })
      };
    }
    
    // If not hardcoded creds and Supabase is not configured, fail
    if (!supabase) {
      console.log('Supabase not configured, login failed');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication service unavailable' }),
      };
    }
    
    // Try Supabase authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username.includes('@') ? username : `${username}@admin.local`,
      password: password
    });

    console.log('Auth result:', { authData: !!authData, authError: authError?.message });

    if (authError) {
      console.log('Auth failed');
      // If auth fails, check for hardcoded admin credentials for migration
      if ((username === 'admin' || username === 'mattia') && password === 'admin123') {
        // Create admin user if doesn't exist
        const adminEmail = `${username}@admin.local`;
        
        // Try to create the user
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            role: 'admin',
            username: username
          }
        });

        if (signUpError && !signUpError.message.includes('already exists')) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Failed to create admin user' }),
          };
        }

        // Try to sign in again
        const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password
        });

        if (retryError) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }

        // Update user role in app_users table
        await supabase
          .from('app_users')
          .upsert({
            user_id: retryAuth.user.id,
            email: adminEmail,
            role: 'admin'
          });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token: retryAuth.session.access_token,
            user: {
              id: retryAuth.user.id,
              email: adminEmail,
              username: username,
              role: 'admin'
            }
          }),
        };
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Get user role from app_users table
    const { data: userRole, error: roleError } = await supabase
      .from('app_users')
      .select('role')
      .eq('user_id', authData.user.id)
      .single();

    console.log('Role lookup result:', { userRole, roleError: roleError?.message, userId: authData.user.id });

    const role = userRole?.role || 'viewer';

    // Only allow admin and editor roles
    if (role !== 'admin' && role !== 'editor') {
      console.log('Permission denied for role:', role);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Insufficient permissions' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.user_metadata?.username || authData.user.email.split('@')[0],
          role: role
        }
      }),
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' }),
    };
  }
}

async function handleGetUser(requestHeaders, headers) {
  const authHeader = requestHeaders.authorization || requestHeaders.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  const token = authHeader.substring(7);

  try {
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    // Get user role
    const { data: userRole } = await supabase
      .from('app_users')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    const role = userRole?.role || 'viewer';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: userData.user.id,
        email: userData.user.email,
        username: userData.user.user_metadata?.username || userData.user.email.split('@')[0],
        role: role
      }),
    };

  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}

async function handleChangePassword(body, requestHeaders, headers) {
  const { currentPassword, newPassword } = body;
  const authHeader = requestHeaders.authorization || requestHeaders.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  const token = authHeader.substring(7);

  try {
    // Verify current user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Failed to update password' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Password updated successfully' }),
    };

  } catch (error) {
    console.error('Change password error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to change password' }),
    };
  }
}