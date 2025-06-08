import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const VideoHero = ({ darkMode, title, subtitle, primaryCTA, secondaryCTA }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Video playlist
  const videos = [
    '/videos/ukrainian-aid-intro.mp4',
    '/videos/ukrainian-culture.mp4'
  ];

  useEffect(() => {
    // Ensure video plays on mobile by re-triggering play
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => {
        console.log('Autoplay failed:', err);
        // Fallback: show poster or static image
        setVideoError(true);
      });
    }
  }, [currentVideoIndex]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load');
  };

  const handleVideoEnded = () => {
    // Move to next video in playlist
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onEnded={handleVideoEnded}
            className={`absolute inset-0 w-full h-full object-cover ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-1000`}
            poster="/images/ukraine-aid-poster.jpg" // Add a poster image as fallback
            key={currentVideoIndex} // Force re-render when video changes
          >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
          </video>
          
          {/* Loading placeholder */}
          {!isVideoLoaded && (
            <div className={`absolute inset-0 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            } animate-pulse`} />
          )}
        </div>
      )}

      {/* Fallback gradient background if video fails */}
      {videoError && (
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
            : 'bg-gradient-to-b from-blue-50 to-white'
        }`} />
      )}

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
              {title.line1}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {title.line2}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-100 drop-shadow-md">
              {subtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link 
                to={primaryCTA.link}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm bg-opacity-90"
              >
                {primaryCTA.text}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              
              <Link 
                to={secondaryCTA.link}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-2xl text-white border-2 border-white/80 hover:bg-white hover:text-gray-900 shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                {secondaryCTA.text}
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-white/70" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Video controls for accessibility */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {/* Video playlist indicators */}
        <div className="flex gap-1 justify-end mb-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentVideoIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Play video ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Play/Pause button */}
        <button
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              if (video.paused) {
                video.play();
              } else {
                video.pause();
              }
            }
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
          aria-label="Toggle video playback"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default VideoHero;