import { useState, useEffect, useRef } from 'react';
import {
  isQuillLoaded,
  markQuillAsLoaded,
  incrementQuillErrorCount,
  createConsoleOverride,
  registerQuillInstance,
  unregisterQuillInstance,
} from '../utils/quillUtils';

// Global state to track if Quill is already loaded
let quillLoadingPromise = null;

/**
 * Custom hook to manage ReactQuill loading
 * Ensures Quill is only loaded once across all components
 */
export const useQuillLoader = () => {
  const [isLoading, setIsLoading] = useState(!isQuillLoaded());
  const [error, setError] = useState(null);
  const [QuillComponent, setQuillComponent] = useState(null);
  const mountedRef = useRef(true);
  const instanceId = useRef(
    `quill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  useEffect(() => {
    // Register this instance
    registerQuillInstance(instanceId);

    const loadQuill = async () => {
      // If already loaded, return immediately
      if (isQuillLoaded() && QuillComponent) {
        setIsLoading(false);
        return;
      }

      // If already loading, wait for the existing promise
      if (quillLoadingPromise) {
        try {
          const result = await quillLoadingPromise;
          if (mountedRef.current) {
            setQuillComponent(result);
            setIsLoading(false);
            markQuillAsLoaded();
          }
        } catch (err) {
          if (mountedRef.current) {
            incrementQuillErrorCount();
            setError(err);
            setIsLoading(false);
          }
        }
        return;
      }

      // Start loading Quill
      quillLoadingPromise = new Promise(async (resolve, reject) => {
        try {
          // Check if Quill is already in the global scope
          if (window.Quill && window.ReactQuill) {
            const { default: QuillModule } = await import('react-quill');
            resolve(QuillModule);
            return;
          }

          // Suppress console warnings during load
          const originalError = console.error;
          const originalWarn = console.warn;
          const consoleOverride = createConsoleOverride();

          // Check and prevent duplicate custom element registration
          if (window.customElements && window.customElements.get('autosize-textarea')) {
            console.debug('autosize-textarea already registered, skipping registration');
            // Override customElements.define temporarily
            const originalDefine = window.customElements.define;
            window.customElements.define = function (name, ...args) {
              if (name === 'autosize-textarea' && window.customElements.get(name)) {
                console.debug('Prevented duplicate registration of autosize-textarea');
                return;
              }
              return originalDefine.apply(this, [name, ...args]);
            };
          }

          // Dynamic import with timeout
          const loadWithTimeout = (ms = 10000) => {
            return Promise.race([
              Promise.all([import('react-quill'), import('react-quill/dist/quill.snow.css')]),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Quill load timeout')), ms)
              ),
            ]);
          };

          const [QuillModule] = await loadWithTimeout();

          // Restore console methods
          setTimeout(() => {
            console.error = originalError;
            console.warn = originalWarn;
          }, 100);

          // Mark as loaded globally
          isQuillLoaded = true;
          resolve(QuillModule.default);
        } catch (err) {
          console.error('Failed to load ReactQuill:', err);
          reject(err);
        }
      });

      try {
        const result = await quillLoadingPromise;
        if (mountedRef.current) {
          setQuillComponent(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    loadQuill();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      unregisterQuillInstance(instanceId);
    };
  }, [QuillComponent, instanceId]);

  return {
    isLoading,
    error,
    QuillComponent,
    isQuillLoaded,
  };
};

/**
 * Fallback textarea component when Quill fails to load
 */
export const FallbackEditor = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  className = '',
  darkMode = false,
}) => {
  return (
    <div className="space-y-2">
      <div
        className={`p-3 rounded-md border text-sm ${
          darkMode
            ? 'bg-yellow-900 text-yellow-200 border-yellow-700'
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
        }`}
      >
        <p>Rich text editor is not available. Using plain text editor.</p>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full min-h-[200px] p-3 border rounded-md resize-vertical ${className} ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`}
      />
    </div>
  );
};

export default useQuillLoader;
