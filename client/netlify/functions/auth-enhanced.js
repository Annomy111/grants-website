import { createClient } from '@supabase/supabase-js';
import { withRateLimit, rateLimitByUser } from './middleware/rateLimiter.js';
import { generateSecureToken, logAuthEvent } from './middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

// Security headers
const getSecurityHeaders = (origin) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  };
};

// Get client IP
const getClientIP = (event) => {
  return event.headers['x-nf-client-connection-ip'] || 
         event.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

export const handler = withRateLimit(async (event, context) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = getSecurityHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/auth-enhanced', '');
  const method = event.httpMethod;

  try {
    // Route: POST /auth/login
    if (method === 'POST' && path === '/login') {
      return await handleLogin(JSON.parse(event.body), event, headers);
    }

    // Route: GET /auth/me
    if (method === 'GET' && path === '/me') {
      return await handleGetUser(event.headers, headers);
    }

    // Route: POST /auth/change-password
    if (method === 'POST' && path === '/change-password') {
      return await handleChangePassword(JSON.parse(event.body), event.headers, headers);
    }

    // Route: POST /auth/logout
    if (method === 'POST' && path === '/logout') {
      return await handleLogout(event.headers, headers);
    }

    // Route: POST /auth/2fa/setup
    if (method === 'POST' && path === '/2fa/setup') {
      return await handle2FASetup(event.headers, headers);
    }

    // Route: POST /auth/2fa/verify
    if (method === 'POST' && path === '/2fa/verify') {
      return await handle2FAVerify(JSON.parse(event.body), event.headers, headers);
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
}, 'auth');

async function handleLogin(body, event, headers) {
  const { username, password, csrfToken, twoFactorCode } = body;
  const clientIP = getClientIP(event);
  const userAgent = event.headers['user-agent'] || '';

  // Validate CSRF token
  const sessionCsrf = event.headers['x-csrf-token'];
  if (!csrfToken || csrfToken !== sessionCsrf) {
    await logAuthEvent({
      userId: username,
      type: 'login_failed',
      ip: clientIP,
      userAgent,
      success: false,
      error: 'Invalid CSRF token'
    });
    
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Invalid CSRF token' }),
    };
  }

  // Input validation
  if (!username || !password || username.length > 100 || password.length > 200) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid username or password format' }),
    };
  }

  // Check rate limiting by IP and username
  const ipRateLimit = rateLimitByUser(`ip:${clientIP}`, 'login', 5, 15 * 60 * 1000);
  const userRateLimit = rateLimitByUser(`user:${username}`, 'login', 3, 15 * 60 * 1000);

  if (ipRateLimit.exceeded || userRateLimit.exceeded) {
    await logAuthEvent({
      userId: username,
      type: 'login_rate_limited',
      ip: clientIP,
      userAgent,
      success: false,
      error: 'Rate limit exceeded'
    });

    return {
      statusCode: 429,
      headers: {
        ...headers,
        'Retry-After': Math.max(ipRateLimit.retryAfter, userRateLimit.retryAfter).toString()
      },
      body: JSON.stringify({ 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.max(ipRateLimit.retryAfter, userRateLimit.retryAfter)
      }),
    };
  }

  try {
    // Remove hardcoded credentials - require proper authentication
    if (!supabase) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Authentication service unavailable' }),
      };
    }

    // Try Supabase authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username.includes('@') ? username : `${username}@admin.local`,
      password: password,
    });

    if (authError) {
      await logAuthEvent({
        userId: username,
        type: 'login_failed',
        ip: clientIP,
        userAgent,
        success: false,
        error: authError.message
      });

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Get user role and check if active
    const { data: userRole, error: roleError } = await supabase
      .from('app_users')
      .select('role, is_active, two_factor_enabled')
      .eq('user_id', authData.user.id)
      .single();

    if (!userRole?.is_active) {
      await logAuthEvent({
        userId: authData.user.id,
        type: 'login_blocked',
        ip: clientIP,
        userAgent,
        success: false,
        error: 'Account disabled'
      });

      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Account is disabled' }),
      };
    }

    const role = userRole?.role || 'viewer';

    // Only allow admin and editor roles
    if (role !== 'admin' && role !== 'editor') {
      await logAuthEvent({
        userId: authData.user.id,
        type: 'login_unauthorized',
        ip: clientIP,
        userAgent,
        success: false,
        error: 'Insufficient permissions'
      });

      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Insufficient permissions' }),
      };
    }

    // Check 2FA if enabled
    if (userRole.two_factor_enabled) {
      if (!twoFactorCode) {
        // Return partial success, requiring 2FA
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            requiresTwoFactor: true,
            tempToken: generateTempToken(authData.user.id)
          }),
        };
      }

      // Verify 2FA code
      const isValid2FA = await verify2FACode(authData.user.id, twoFactorCode);
      if (!isValid2FA) {
        await logAuthEvent({
          userId: authData.user.id,
          type: 'login_2fa_failed',
          ip: clientIP,
          userAgent,
          success: false,
          error: 'Invalid 2FA code'
        });

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid 2FA code' }),
        };
      }
    }

    // Generate secure JWT token
    const token = generateSecureToken({
      id: authData.user.id,
      email: authData.user.email,
      username: authData.user.user_metadata?.username || authData.user.email.split('@')[0],
      role: role,
      sessionId: crypto.randomBytes(16).toString('hex')
    });

    // Log successful login
    await logAuthEvent({
      userId: authData.user.id,
      type: 'login_success',
      ip: clientIP,
      userAgent,
      success: true,
      metadata: { role }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.user_metadata?.username || authData.user.email.split('@')[0],
          role: role,
        },
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

    // Get user role and check if active
    const { data: userRole } = await supabase
      .from('app_users')
      .select('role, is_active')
      .eq('user_id', userData.user.id)
      .single();

    if (!userRole?.is_active) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Account is disabled' }),
      };
    }

    const role = userRole?.role || 'viewer';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: userData.user.id,
        email: userData.user.email,
        username: userData.user.user_metadata?.username || userData.user.email.split('@')[0],
        role: role,
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

  // Validate new password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' 
      }),
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

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Current password is incorrect' }),
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Failed to update password' }),
      };
    }

    // Log password change
    await logAuthEvent({
      userId: userData.user.id,
      type: 'password_changed',
      ip: requestHeaders['x-nf-client-connection-ip'] || 'unknown',
      userAgent: requestHeaders['user-agent'] || '',
      success: true
    });

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

async function handleLogout(requestHeaders, headers) {
  const authHeader = requestHeaders.authorization || requestHeaders.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Logged out successfully' }),
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Logout failed' }),
    };
  }
}

// Helper functions
function generateTempToken(userId) {
  const payload = {
    userId,
    type: 'temp_2fa',
    exp: Date.now() + 5 * 60 * 1000 // 5 minutes
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

async function verify2FACode(userId, code) {
  // Implement proper 2FA verification
  // This is a placeholder - use a proper TOTP library
  return code === '123456'; // Never use this in production
}

async function handle2FASetup(requestHeaders, headers) {
  // Implement 2FA setup
  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({ error: 'Not implemented' }),
  };
}

async function handle2FAVerify(body, requestHeaders, headers) {
  // Implement 2FA verification
  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({ error: 'Not implemented' }),
  };
}