/**
 * Simple in-memory cache for API responses
 */
class CacheManager {
  constructor(ttl = 5 * 60 * 1000) { // Default 5 minutes TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Generate a cache key from URL and params
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get(url, params) {
    const key = this.generateKey(url, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Store data in cache
   */
  set(url, params, data) {
    const key = this.generateKey(url, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(url, params) {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }
}

// Create singleton instance
export const apiCache = new CacheManager();

/**
 * Cached axios-like fetch wrapper
 */
export async function cachedFetch(url, options = {}) {
  const { params = {}, forceRefresh = false, ...fetchOptions } = options;
  
  // Check cache first
  if (!forceRefresh) {
    const cached = apiCache.get(url, params);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }
  
  // Build URL with params
  const urlWithParams = new URL(url, window.location.origin);
  Object.keys(params).forEach(key => 
    urlWithParams.searchParams.append(key, params[key])
  );
  
  try {
    const response = await fetch(urlWithParams.toString(), fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the successful response
    apiCache.set(url, params, data);
    
    return { data, fromCache: false };
  } catch (error) {
    // If fetch fails, try to return stale cache if available
    const staleCache = apiCache.get(url, params);
    if (staleCache) {
      console.warn('Returning stale cache due to fetch error:', error);
      return { data: staleCache, fromCache: true, stale: true };
    }
    
    throw error;
  }
}