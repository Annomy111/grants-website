/**
 * Rate limiting middleware for Netlify Functions
 * Uses in-memory storage (resets on function cold start)
 * For production, consider using Redis or a similar persistent store
 */

// Store for rate limit data
const rateLimitStore = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Default limits
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  // Strict limits for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  },
  // Medium limits for API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50
  },
  // Relaxed limits for public endpoints
  public: {
    windowMs: 15 * 60 * 1000,
    max: 200
  }
};

/**
 * Get client IP from request
 * @param {object} event - Netlify event object
 * @returns {string} Client IP
 */
const getClientIP = (event) => {
  // Netlify provides client IP in headers
  return event.headers['x-nf-client-connection-ip'] || 
         event.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

/**
 * Clean up expired entries
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

/**
 * Rate limiter middleware
 * @param {string} type - Type of rate limit to apply
 * @returns {function} Middleware function
 */
export const rateLimiter = (type = 'default') => {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
  
  return async (event, context, next) => {
    // Skip rate limiting for OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
      return next ? await next(event, context) : null;
    }

    const clientIP = getClientIP(event);
    const key = `${type}:${clientIP}`;
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupExpiredEntries();
    }
    
    // Get or create rate limit data for this client
    let limitData = rateLimitStore.get(key);
    
    if (!limitData || limitData.resetTime < now) {
      // Create new window
      limitData = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    // Increment request count
    limitData.count++;
    rateLimitStore.set(key, limitData);
    
    // Check if limit exceeded
    if (limitData.count > config.max) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
      
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
          'Retry-After': retryAfter.toString()
        },
        body: JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter
        })
      };
    }
    
    // Add rate limit headers to response
    const remainingRequests = Math.max(0, config.max - limitData.count);
    const response = next ? await next(event, context) : null;
    
    if (response && response.headers) {
      response.headers['X-RateLimit-Limit'] = config.max.toString();
      response.headers['X-RateLimit-Remaining'] = remainingRequests.toString();
      response.headers['X-RateLimit-Reset'] = new Date(limitData.resetTime).toISOString();
    }
    
    return response;
  };
};

/**
 * Apply rate limiting to a handler function
 * @param {function} handler - Handler function
 * @param {string} type - Rate limit type
 * @returns {function} Wrapped handler
 */
export const withRateLimit = (handler, type = 'default') => {
  return async (event, context) => {
    const limiter = rateLimiter(type);
    
    // Create a next function that calls the original handler
    const next = async (event, context) => {
      return await handler(event, context);
    };
    
    return await limiter(event, context, next);
  };
};

/**
 * Rate limit by user ID (for authenticated endpoints)
 * @param {string} userId - User ID
 * @param {string} action - Action being performed
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} Rate limit result
 */
export const rateLimitByUser = (userId, action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const key = `user:${userId}:${action}`;
  const now = Date.now();
  
  let limitData = rateLimitStore.get(key);
  
  if (!limitData || limitData.resetTime < now) {
    limitData = {
      count: 0,
      resetTime: now + windowMs
    };
  }
  
  limitData.count++;
  rateLimitStore.set(key, limitData);
  
  const remaining = Math.max(0, maxAttempts - limitData.count);
  const exceeded = limitData.count > maxAttempts;
  
  return {
    exceeded,
    remaining,
    resetTime: limitData.resetTime,
    retryAfter: exceeded ? Math.ceil((limitData.resetTime - now) / 1000) : 0
  };
};

/**
 * Advanced rate limiting with sliding window
 * @param {string} identifier - Unique identifier
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if allowed, false if rate limited
 */
export const slidingWindowRateLimit = (identifier, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create request log for this identifier
  let requestLog = rateLimitStore.get(`sliding:${identifier}`) || [];
  
  // Remove old entries outside the window
  requestLog = requestLog.filter(timestamp => timestamp > windowStart);
  
  // Check if limit would be exceeded
  if (requestLog.length >= maxRequests) {
    return false;
  }
  
  // Add current request
  requestLog.push(now);
  rateLimitStore.set(`sliding:${identifier}`, requestLog);
  
  return true;
};