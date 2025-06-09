/**
 * Utility functions for managing ReactQuill instances
 * Helps prevent conflicts and manage global state
 */

// Global tracking of Quill state
const QUILL_STATE = {
  isLoaded: false,
  loadingPromise: null,
  instances: new Set(),
  errorCount: 0,
};

/**
 * Registers a new Quill instance
 * @param {string} instanceId - Unique identifier for the instance
 */
export const registerQuillInstance = instanceId => {
  QUILL_STATE.instances.add(instanceId);
  console.debug(`Quill instance registered: ${instanceId}. Total: ${QUILL_STATE.instances.size}`);
};

/**
 * Unregisters a Quill instance
 * @param {string} instanceId - Unique identifier for the instance
 */
export const unregisterQuillInstance = instanceId => {
  QUILL_STATE.instances.delete(instanceId);
  console.debug(`Quill instance unregistered: ${instanceId}. Total: ${QUILL_STATE.instances.size}`);
};

/**
 * Gets the number of active Quill instances
 * @returns {number}
 */
export const getActiveQuillInstances = () => {
  return QUILL_STATE.instances.size;
};

/**
 * Checks if Quill is already loaded
 * @returns {boolean}
 */
export const isQuillLoaded = () => {
  return QUILL_STATE.isLoaded || (window.Quill && window.ReactQuill);
};

/**
 * Safely defines a custom element, preventing duplicate registration errors
 * @param {string} name - Custom element name
 * @param {function} constructor - Element constructor
 * @param {object} options - Options for define
 */
export const safeDefineCustomElement = (name, constructor, options) => {
  if (window.customElements && !window.customElements.get(name)) {
    try {
      window.customElements.define(name, constructor, options);
    } catch (error) {
      if (!error.message.includes('already been defined')) {
        throw error;
      }
      console.debug(`Custom element ${name} already defined, skipping`);
    }
  }
};

/**
 * Marks Quill as loaded
 */
export const markQuillAsLoaded = () => {
  QUILL_STATE.isLoaded = true;
};

/**
 * Increments error count for monitoring
 */
export const incrementQuillErrorCount = () => {
  QUILL_STATE.errorCount++;
  console.warn(`Quill error count: ${QUILL_STATE.errorCount}`);
};

/**
 * Gets current error count
 * @returns {number}
 */
export const getQuillErrorCount = () => {
  return QUILL_STATE.errorCount;
};

/**
 * Resets error count (useful for retry mechanisms)
 */
export const resetQuillErrorCount = () => {
  QUILL_STATE.errorCount = 0;
};

/**
 * Suppresses specific console messages during Quill loading
 * @param {function} originalMethod - Original console method
 * @param {...any} args - Console arguments
 */
export const suppressQuillWarnings = (originalMethod, ...args) => {
  const message = args[0]?.toString?.() || '';
  const suppressPatterns = [
    'autosize-textarea',
    'already defined',
    'already been defined',
    'custom element',
    'customElements.define',
    "DOMException: Failed to execute 'define'",
    'The name "autosize-textarea" has already been used',
    'NotSupportedError',
    'webcomponents-ce.js',
    'A custom element with name',
  ];

  if (suppressPatterns.some(pattern => message.includes(pattern))) {
    return; // Suppress this message
  }

  originalMethod.apply(console, args);
};

/**
 * Creates a safe console override for Quill loading
 * @returns {object} - Object with restore function
 */
export const createConsoleOverride = () => {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => suppressQuillWarnings(originalError, ...args);
  console.warn = (...args) => suppressQuillWarnings(originalWarn, ...args);

  return {
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
    },
  };
};

/**
 * Default Quill modules configuration
 */
export const DEFAULT_QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

/**
 * Extended Quill modules with more features
 */
export const EXTENDED_QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

/**
 * Quill formats for content validation
 */
export const QUILL_FORMATS = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'color',
  'background',
  'align',
  'direction',
  'code-block',
  'script',
];

export default {
  registerQuillInstance,
  unregisterQuillInstance,
  getActiveQuillInstances,
  isQuillLoaded,
  markQuillAsLoaded,
  incrementQuillErrorCount,
  getQuillErrorCount,
  resetQuillErrorCount,
  suppressQuillWarnings,
  createConsoleOverride,
  DEFAULT_QUILL_MODULES,
  EXTENDED_QUILL_MODULES,
  QUILL_FORMATS,
};
