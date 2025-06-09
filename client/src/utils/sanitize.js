import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content
 * @param {object} options - DOMPurify options
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html, options = {}) => {
  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em',
      'u', 'code', 'pre', 'hr', 'img', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'caption'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'src', 'alt', 'class', 'id',
      'width', 'height', 'colspan', 'rowspan', 'style'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    ...options
  };

  // Additional security: remove any script tags and event handlers
  const config = {
    ...defaultOptions,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur']
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Sanitize user input for display (escapes HTML)
 * @param {string} input - User input
 * @returns {string} Escaped string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize URL to prevent XSS and open redirect attacks
 * @param {string} url - URL to sanitize
 * @param {array} allowedDomains - List of allowed domains
 * @returns {string} Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url, allowedDomains = []) => {
  if (!url || typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Check if domain is in allowed list (if provided)
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) return '';
    }

    return urlObj.toString();
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (url.startsWith('/') && !url.startsWith('//')) {
      return sanitizeInput(url);
    }
    return '';
  }
};

/**
 * Sanitize filename to prevent directory traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  
  // Remove any path separators and null bytes
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.{2,}/g, '.')
    .trim();
};

/**
 * Sanitize SQL input to prevent SQL injection
 * @param {string} input - SQL input
 * @returns {string} Sanitized input
 */
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return '';
  
  // Basic SQL injection prevention
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/script/gi, '');
};

/**
 * Remove sensitive data from objects
 * @param {object} obj - Object to clean
 * @param {array} sensitiveKeys - Keys to remove
 * @returns {object} Cleaned object
 */
export const removeSensitiveData = (obj, sensitiveKeys = ['password', 'token', 'apiKey', 'secret']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = { ...obj };
  
  sensitiveKeys.forEach(key => {
    // Case-insensitive key matching
    Object.keys(cleaned).forEach(objKey => {
      if (objKey.toLowerCase().includes(key.toLowerCase())) {
        delete cleaned[objKey];
      }
    });
  });
  
  return cleaned;
};