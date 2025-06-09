import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const BackToTop = () => {
  const { darkMode } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      setIsScrolling(true);
      toggleVisibility();
      
      // Reset scrolling state after scrolling stops
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollTimeout);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg
        transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
        ${isScrolling ? 'scale-90' : 'scale-100'}
        ${darkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
          : 'bg-white hover:bg-gray-50 text-gray-700'
        }
        hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2
        ${darkMode ? 'focus:ring-gray-600' : 'focus:ring-gray-400'}
        group
      `}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={darkMode ? '#374151' : '#E5E7EB'}
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={darkMode ? '#60A5FA' : '#3B82F6'}
          strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 22}`}
          strokeDashoffset={`${2 * Math.PI * 22 * (1 - Math.min(window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight), 1))}`}
          className="transition-all duration-150"
        />
      </svg>
    </button>
  );
};

// Alternative minimal version
export const MinimalBackToTop = () => {
  const { darkMode } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`
        fixed bottom-20 right-6 z-40 p-2 rounded-lg
        transition-all duration-300
        ${darkMode 
          ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-300' 
          : 'bg-white/80 hover:bg-white text-gray-600'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
      `}
      aria-label="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 11l5-5m0 0l5 5m-5-5v12"
        />
      </svg>
    </button>
  );
};

export default BackToTop;