import React, { useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { ThemeContext } from '../context/ThemeContext';

const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  modalId,
}) => {
  const { darkMode } = useContext(ThemeContext);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Size classes
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full h-full',
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Return focus to the previously focused element
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleTabKey);

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={modalId ? `${modalId}-title` : 'modal-title'}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 transition-opacity ${
          darkMode ? 'bg-black bg-opacity-75' : 'bg-gray-500 bg-opacity-75'
        }`}
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal Panel */}
        <div
          ref={modalRef}
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full ${className} ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          tabIndex={-1}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 ${
              darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                id={modalId ? `${modalId}-title` : 'modal-title'}
                className={`text-lg font-medium leading-6 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {title}
              </h3>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-md p-2 inline-flex items-center justify-center ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
                  aria-label="Close modal"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Portal render
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AccessibleModal;