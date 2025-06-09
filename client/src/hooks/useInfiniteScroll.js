import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scroll functionality
 * @param {Function} fetchMore - Function to fetch more items
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {Object} options - Configuration options
 * @returns {Object} - Hook state and utilities
 */
export function useInfiniteScroll(fetchMore, hasMore = true, options = {}) {
  const {
    threshold = 100, // pixels from bottom to trigger load
    initialLoad = true,
    delay = 0, // debounce delay
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const delayTimeoutRef = useRef(null);

  // Sentinel element to observe
  const sentinelRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (!node || !hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0
      }
    );
    
    observerRef.current.observe(node);
  }, [loading, hasMore, threshold]);

  const loadMoreItems = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    // Clear any existing timeout
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    
    // Apply delay if specified
    delayTimeoutRef.current = setTimeout(async () => {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        await fetchMore(page);
        setPage(prev => prev + 1);
      } catch (err) {
        setError(err);
        console.error('Error loading more items:', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    }, delay);
  }, [fetchMore, hasMore, page, delay]);

  // Initial load
  useEffect(() => {
    if (initialLoad && page === 1) {
      loadMoreItems();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);

  // Manual trigger for loading more
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMoreItems();
    }
  }, [loading, hasMore, loadMoreItems]);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(1);
    setError(null);
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return {
    loading,
    error,
    page,
    sentinelRef,
    loadMore,
    reset,
  };
}

/**
 * Hook for virtualized list rendering
 * @param {Array} items - Full list of items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @param {number} overscan - Number of items to render outside viewport
 * @returns {Object} - Virtualization state
 */
export function useVirtualizedList(items, itemHeight, containerHeight, overscan = 3) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}