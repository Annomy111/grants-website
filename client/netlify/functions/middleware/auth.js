import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { rateLimitByUser } from './rateLimiter.js';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token or null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Generate secure JWT token
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Expiration time
 * @returns {string} JWT token
 */
export const generateSecureToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'grants-website',
    audience: 'grants-api'
  });
};

/**
 * Authentication middleware
 * @param {array} allowedRoles - Allowed roles for this endpoint
 * @returns {function} Middleware function
 */
export const authenticate = (allowedRoles = ['admin', 'editor']) => {
  return async (event, context, next) => {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Get authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    const token = authHeader.substring(7);

    try {
      // First try to verify with Supabase
      if (supabase) {
        const { data: userData, error } = await supabase.auth.getUser(token);
        
        if (!error && userData.user) {
          // Get user role from app_users table
          const { data: userRole } = await supabase
            .from('app_users')
            .select('role, is_active')
            .eq('user_id', userData.user.id)
            .single();

          // Check if user is active
          if (!userRole?.is_active) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ error: 'Account is disabled' })
            };
          }

          // Check role permissions
          if (!allowedRoles.includes(userRole?.role)) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ error: 'Insufficient permissions' })
            };
          }

          // Add user info to event context
          event.user = {
            id: userData.user.id,
            email: userData.user.email,
            role: userRole.role,
            metadata: userData.user.user_metadata
          };

          // Continue to next handler
          return next ? await next(event, context) : null;
        }
      }

      // Fallback to JWT verification
      const decoded = verifyToken(token);
      if (!decoded) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }

      // Check token expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token expired' })
        };
      }

      // Check role permissions
      if (!allowedRoles.includes(decoded.role)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      // Add user info to event context
      event.user = decoded;

      // Continue to next handler
      return next ? await next(event, context) : null;

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication failed' })
      };
    }
  };
};

/**
 * Apply authentication to a handler function
 * @param {function} handler - Handler function
 * @param {array} allowedRoles - Allowed roles
 * @returns {function} Wrapped handler
 */
export const withAuth = (handler, allowedRoles = ['admin', 'editor']) => {
  return async (event, context) => {
    const auth = authenticate(allowedRoles);
    
    const next = async (event, context) => {
      return await handler(event, context);
    };
    
    return await auth(event, context, next);
  };
};

/**
 * Validate API key for service-to-service authentication
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey) return false;

  // In production, validate against database or secure storage
  // For now, check against environment variable
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validApiKeys.includes(apiKey);
};

/**
 * Two-factor authentication check
 * @param {string} userId - User ID
 * @param {string} code - 2FA code
 * @returns {boolean} True if valid
 */
export const verify2FA = async (userId, code) => {
  if (!supabase) return false;

  try {
    // Get user's 2FA secret from database
    const { data: user2FA } = await supabase
      .from('user_2fa')
      .select('secret, backup_codes')
      .eq('user_id', userId)
      .single();

    if (!user2FA) return false;

    // In production, use a proper TOTP library
    // This is a simplified example
    const expectedCode = generateTOTPCode(user2FA.secret);
    
    if (code === expectedCode) {
      return true;
    }

    // Check backup codes
    if (user2FA.backup_codes && user2FA.backup_codes.includes(code)) {
      // Remove used backup code
      const updatedCodes = user2FA.backup_codes.filter(c => c !== code);
      await supabase
        .from('user_2fa')
        .update({ backup_codes: updatedCodes })
        .eq('user_id', userId);
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
};

/**
 * Generate TOTP code (simplified - use proper library in production)
 * @param {string} secret - TOTP secret
 * @returns {string} 6-digit code
 */
const generateTOTPCode = (secret) => {
  const time = Math.floor(Date.now() / 30000);
  const hash = require('crypto').createHmac('sha1', secret)
    .update(Buffer.from([0, 0, 0, 0, time]))
    .digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
};

/**
 * Log authentication events for audit trail
 * @param {object} event - Event details
 */
export const logAuthEvent = async (event) => {
  if (!supabase) return;

  try {
    await supabase.from('auth_logs').insert({
      user_id: event.userId,
      event_type: event.type,
      ip_address: event.ip,
      user_agent: event.userAgent,
      success: event.success,
      error_message: event.error,
      metadata: event.metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

/**
 * Check if IP is whitelisted for admin access
 * @param {string} ip - IP address
 * @returns {boolean} True if whitelisted
 */
export const checkIPWhitelist = async (ip) => {
  if (!supabase) return true; // Allow if no database

  try {
    const { data: whitelist } = await supabase
      .from('ip_whitelist')
      .select('ip_address')
      .eq('is_active', true);

    if (!whitelist || whitelist.length === 0) return true; // No whitelist configured

    return whitelist.some(entry => {
      if (entry.ip_address === ip) return true;
      
      // Support CIDR notation (simplified)
      if (entry.ip_address.includes('/')) {
        const [network, mask] = entry.ip_address.split('/');
        // Implement CIDR matching logic here
        return false; // Placeholder
      }
      
      return false;
    });
  } catch (error) {
    console.error('IP whitelist check error:', error);
    return true; // Allow on error to prevent lockout
  }
};