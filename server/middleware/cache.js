const NodeCache = require('node-cache');

// Create cache instance with TTL (time to live) in seconds
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default cache
  checkperiod: 60 // Check for expired keys every 60 seconds
});

// Cache middleware factory
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Create cache key from request URL and query parameters
    const key = `${req.originalUrl || req.url}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(key);
    
    if (cachedData) {
      console.log(`Cache hit for ${key}`);
      return res.json(cachedData);
    }
    
    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response data
      cache.set(key, data, duration);
      console.log(`Cache set for ${key}`);
      
      // Call original res.json
      originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache function for specific patterns
const clearCache = (pattern) => {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
      console.log(`Cache cleared for ${key}`);
    }
  });
};

// Clear all cache
const clearAllCache = () => {
  cache.flushAll();
  console.log('All cache cleared');
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  cache
};