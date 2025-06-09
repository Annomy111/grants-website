import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const GrantBookmark = ({ grant, className = '' }) => {
  const { darkMode } = useContext(ThemeContext);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get grant ID (support both database and static JSON formats)
  const getGrantId = () => {
    return grant.id || grant['Grant Name'] || '';
  };

  // Load bookmarked state from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedGrants') || '[]');
    setIsBookmarked(bookmarks.includes(getGrantId()));
  }, [grant]);

  const toggleBookmark = (e) => {
    e.stopPropagation(); // Prevent card click event
    e.preventDefault();

    const grantId = getGrantId();
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedGrants') || '[]');

    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(id => id !== grantId);
    } else {
      newBookmarks = [...bookmarks, grantId];
    }

    localStorage.setItem('bookmarkedGrants', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('bookmarksUpdated', { 
      detail: { grantId, isBookmarked: !isBookmarked }
    }));
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`
        relative p-2 rounded-lg transition-all duration-200
        ${darkMode 
          ? 'hover:bg-gray-700/50' 
          : 'hover:bg-gray-100'
        }
        ${className}
      `}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`
          h-5 w-5 transition-all duration-200
          ${isAnimating ? 'scale-125' : 'scale-100'}
          ${isBookmarked 
            ? darkMode ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-500 fill-yellow-500'
            : darkMode ? 'text-gray-400' : 'text-gray-500'
          }
        `}
        fill={isBookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>

      {/* Animation effect */}
      {isAnimating && (
        <span className="absolute inset-0 rounded-lg animate-ping opacity-75">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`
              h-5 w-5 m-2
              ${isBookmarked 
                ? 'text-yellow-400' 
                : 'text-gray-400'
              }
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </span>
      )}
    </button>
  );
};

// Hook to get bookmarked grants
export const useBookmarkedGrants = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    // Load initial bookmarks
    const loadBookmarks = () => {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedGrants') || '[]');
      setBookmarkedIds(bookmarks);
    };

    loadBookmarks();

    // Listen for bookmark updates
    const handleBookmarkUpdate = () => {
      loadBookmarks();
    };

    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    window.addEventListener('storage', handleBookmarkUpdate);

    return () => {
      window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
      window.removeEventListener('storage', handleBookmarkUpdate);
    };
  }, []);

  return bookmarkedIds;
};

// Bookmarks counter badge
export const BookmarksCounter = ({ className = '' }) => {
  const bookmarkedIds = useBookmarkedGrants();
  const { darkMode } = useContext(ThemeContext);

  if (bookmarkedIds.length === 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center px-2 py-0.5 
        text-xs font-bold rounded-full
        ${darkMode 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-700'
        }
        ${className}
      `}
    >
      {bookmarkedIds.length}
    </span>
  );
};

export default GrantBookmark;