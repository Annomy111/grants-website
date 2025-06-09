/**
 * Validation utilities for form inputs and data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength score and messages
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 0,
    messages: []
  };

  if (!password) {
    result.messages.push('Password is required');
    return result;
  }

  // Length check
  if (password.length < 8) {
    result.messages.push('Password must be at least 8 characters long');
  } else {
    result.strength += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    result.messages.push('Password must contain at least one uppercase letter');
  } else {
    result.strength += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    result.messages.push('Password must contain at least one lowercase letter');
  } else {
    result.strength += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    result.messages.push('Password must contain at least one number');
  } else {
    result.strength += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.messages.push('Password must contain at least one special character');
  } else {
    result.strength += 1;
  }

  // Common password check
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin123', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    result.messages.push('Password is too common');
    result.strength = Math.max(0, result.strength - 2);
  }

  result.isValid = result.messages.length === 0;
  return result;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate date format and range
 * @param {string} date - Date string to validate
 * @param {object} options - Validation options
 * @returns {boolean} True if valid
 */
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, allowPast = true, allowFuture = true } = options;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const now = new Date();
  
  if (!allowPast && dateObj < now) {
    return false;
  }
  
  if (!allowFuture && dateObj > now) {
    return false;
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return false;
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return false;
  }
  
  return true;
};

/**
 * Validate grant form data
 * @param {object} formData - Grant form data
 * @returns {object} Validation result
 */
export const validateGrantForm = (formData) => {
  const errors = {};

  // Required fields
  if (!formData.grant_name?.trim()) {
    errors.grant_name = 'Grant name is required';
  } else if (formData.grant_name.length > 200) {
    errors.grant_name = 'Grant name must be less than 200 characters';
  }

  if (!formData.funding_organization?.trim()) {
    errors.funding_organization = 'Funding organization is required';
  } else if (formData.funding_organization.length > 200) {
    errors.funding_organization = 'Organization name must be less than 200 characters';
  }

  // Optional fields validation
  if (formData.website_link && !validateURL(formData.website_link)) {
    errors.website_link = 'Please enter a valid URL';
  }

  if (formData.application_deadline && !validateDate(formData.application_deadline, { allowPast: false })) {
    errors.application_deadline = 'Please enter a valid future date';
  }

  if (formData.grant_amount) {
    // Remove currency symbols and validate
    const amount = formData.grant_amount.replace(/[^0-9.,\-\s]/g, '');
    if (!/^[\d,.\-\s]+$/.test(amount)) {
      errors.grant_amount = 'Please enter a valid amount';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate blog post form data
 * @param {object} formData - Blog form data
 * @returns {object} Validation result
 */
export const validateBlogForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  if (!formData.content?.trim()) {
    errors.content = 'Content is required';
  } else if (formData.content.length < 50) {
    errors.content = 'Content must be at least 50 characters';
  }

  if (!formData.slug?.trim()) {
    errors.slug = 'Slug is required';
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
  }

  if (formData.excerpt && formData.excerpt.length > 500) {
    errors.excerpt = 'Excerpt must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  const result = {
    isValid: true,
    error: null
  };

  if (!file) {
    result.isValid = false;
    result.error = 'No file selected';
    return result;
  }

  // Check file size
  if (file.size > maxSize) {
    result.isValid = false;
    result.error = `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    return result;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.error = 'Invalid file type';
    return result;
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    result.isValid = false;
    result.error = 'Invalid file extension';
    return result;
  }

  return result;
};

/**
 * Validate user input length
 * @param {string} input - Input to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if valid
 */
export const validateLength = (input, minLength = 0, maxLength = Infinity) => {
  if (typeof input !== 'string') return false;
  return input.length >= minLength && input.length <= maxLength;
};

/**
 * Validate alphanumeric input
 * @param {string} input - Input to validate
 * @param {boolean} allowSpaces - Allow spaces
 * @returns {boolean} True if valid
 */
export const validateAlphanumeric = (input, allowSpaces = false) => {
  const regex = allowSpaces ? /^[a-zA-Z0-9\s]+$/ : /^[a-zA-Z0-9]+$/;
  return regex.test(input);
};