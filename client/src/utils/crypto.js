import CryptoJS from 'crypto-js';

/**
 * Cryptographic utilities for secure data handling
 */

// Generate a random secret key if not provided
const getSecretKey = () => {
  const envKey = process.env.REACT_APP_CRYPTO_SECRET;
  if (envKey) return envKey;
  
  // Warning: This is for development only. In production, always use environment variable
  console.warn('Using default crypto key. Set REACT_APP_CRYPTO_SECRET in production!');
  return 'default-dev-key-change-in-production';
};

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (optional)
 * @returns {string} Encrypted data
 */
export const encrypt = (data, key = null) => {
  try {
    const secretKey = key || getSecretKey();
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt data
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Decryption key (optional)
 * @returns {any} Decrypted data
 */
export const decrypt = (encryptedData, key = null) => {
  try {
    const secretKey = key || getSecretKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate a secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export const generateToken = (length = 32) => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing (optional)
 * @returns {string} Hashed data
 */
export const hashData = (data, salt = '') => {
  return CryptoJS.SHA256(data + salt).toString();
};

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  const token = generateToken(32);
  // Store in session storage for validation
  sessionStorage.setItem('csrfToken', token);
  return token;
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrfToken');
  return storedToken && storedToken === token;
};

/**
 * Generate a time-based one-time password (TOTP) secret
 * @returns {string} Base32 encoded secret
 */
export const generateTOTPSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
};

/**
 * Generate OTP from secret (simplified version)
 * Note: For production, use a proper TOTP library
 * @param {string} secret - TOTP secret
 * @returns {string} 6-digit OTP
 */
export const generateOTP = (secret) => {
  const time = Math.floor(Date.now() / 30000); // 30-second window
  const hash = hashData(secret + time);
  const otp = parseInt(hash.substring(0, 6), 16) % 1000000;
  return otp.toString().padStart(6, '0');
};

/**
 * Securely compare two strings (timing-attack resistant)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if equal
 */
export const secureCompare = (a, b) => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Generate secure session ID
 * @returns {object} Session data
 */
export const generateSession = () => {
  const sessionId = generateToken(32);
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  return {
    id: sessionId,
    expiresAt,
    fingerprint: generateBrowserFingerprint()
  };
};

/**
 * Generate browser fingerprint for additional security
 * @returns {string} Browser fingerprint
 */
export const generateBrowserFingerprint = () => {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  
  return hashData(JSON.stringify(fingerprint));
};

/**
 * Mask sensitive data for display
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters at start and end
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars * 2) {
    return '****';
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(Math.max(4, data.length - visibleChars * 2));
  
  return `${start}${masked}${end}`;
};