import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer options
 */
const defaultOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.01
};

/**
 * Hook for lazy loading images
 * @param {string} src - The image source
 * @param {string} placeholder - Optional placeholder image
 * @returns {Object} - { imageSrc, imageRef, isLoaded, isError }
 */
export function useLazyLoadImage(src, placeholder = '') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    let observer;
    
    if (imageRef.current && src) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Create a new image to preload
              const img = new Image();
              
              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
                setIsError(false);
              };
              
              img.onerror = () => {
                setIsError(true);
                setIsLoaded(true);
              };
              
              img.src = src;
              
              // Stop observing once loaded
              if (observer && imageRef.current) {
                observer.unobserve(imageRef.current);
              }
            }
          });
        },
        defaultOptions
      );
      
      observer.observe(imageRef.current);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, placeholder]);

  return { imageSrc, imageRef, isLoaded, isError };
}

/**
 * Hook for lazy loading components
 * @param {Function} callback - Function to call when element is visible
 * @returns {Object} - { elementRef, isVisible }
 */
export function useLazyLoadComponent(callback) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    let observer;
    
    if (elementRef.current) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isVisible) {
              setIsVisible(true);
              
              if (callback) {
                callback();
              }
              
              // Stop observing once visible
              if (observer && elementRef.current) {
                observer.unobserve(elementRef.current);
              }
            }
          });
        },
        defaultOptions
      );
      
      observer.observe(elementRef.current);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [callback, isVisible]);

  return { elementRef, isVisible };
}

/**
 * LazyImage component
 */
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder,
  className = '',
  onLoad,
  onError,
  ...props 
}) => {
  const { imageSrc, imageRef, isLoaded, isError } = useLazyLoadImage(src, placeholder);

  useEffect(() => {
    if (isLoaded && !isError && onLoad) {
      onLoad();
    }
    if (isError && onError) {
      onError();
    }
  }, [isLoaded, isError, onLoad, onError]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      {...props}
    />
  );
};

/**
 * Lazy load multiple images at once
 */
export function preloadImages(imageUrls) {
  const promises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load ${url}`));
      img.src = url;
    });
  });
  
  return Promise.allSettled(promises);
}