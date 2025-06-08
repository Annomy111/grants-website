import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
  KeyStatisticsInfographic,
  DisplacementInfographic,
  CivilianCasualtiesInfographic,
  CSOResponseInfographic,
  RoadmapInfographic,
  EuropeSupportInfographic,
  TrendsTimelineInfographic
} from './infographics/UkraineCivilSocietyInfographics';

const BlogPostWithInfographics = ({ content }) => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Replace infographic placeholders with actual components
    const infographicContainers = document.querySelectorAll('.infographic-container');
    
    infographicContainers.forEach(container => {
      const id = container.id;
      let infographicComponent = null;
      
      switch(id) {
        case 'key-statistics-infographic':
          infographicComponent = <KeyStatisticsInfographic darkMode={darkMode} />;
          break;
        case 'displacement-infographic':
          infographicComponent = <DisplacementInfographic darkMode={darkMode} />;
          break;
        case 'civilian-casualties-infographic':
          infographicComponent = <CivilianCasualtiesInfographic darkMode={darkMode} />;
          break;
        case 'cso-response-infographic':
          infographicComponent = <CSOResponseInfographic darkMode={darkMode} />;
          break;
        case 'roadmap-infographic':
          infographicComponent = <RoadmapInfographic darkMode={darkMode} />;
          break;
        case 'europe-support-infographic':
          infographicComponent = <EuropeSupportInfographic darkMode={darkMode} />;
          break;
        case 'trends-timeline-infographic':
          infographicComponent = <TrendsTimelineInfographic darkMode={darkMode} />;
          break;
        default:
          break;
      }
      
      if (infographicComponent && container) {
        // This is a placeholder - in actual implementation, we'd render the component
        container.innerHTML = '<div class="infographic-loading">Loading infographic...</div>';
      }
    });
  }, [content, darkMode]);

  return (
    <div className={`blog-post-content ${darkMode ? 'dark' : 'light'}`}>
      <style jsx>{`
        .infographic-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background: ${darkMode ? '#374151' : '#f3f4f6'};
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          overflow-x: auto;
        }
        
        .infographic-container svg {
          max-width: 100%;
          height: auto;
        }
        
        @media (max-width: 768px) {
          .infographic-container {
            padding: 1rem;
            margin: 1.5rem -1rem;
          }
          
          .infographic-container svg {
            transform: scale(0.8);
            transform-origin: center;
          }
        }
        
        .blog-post-content {
          line-height: 1.8;
          font-size: 1.1rem;
        }
        
        .blog-post-content h2 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          font-size: 2rem;
          font-weight: bold;
          color: ${darkMode ? '#60a5fa' : '#2563eb'};
        }
        
        .blog-post-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: ${darkMode ? '#93c5fd' : '#3b82f6'};
        }
        
        .blog-post-content h4 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${darkMode ? '#dbeafe' : '#60a5fa'};
        }
        
        .blog-post-content ul, .blog-post-content ol {
          margin-left: 2rem;
          margin-bottom: 1.5rem;
        }
        
        .blog-post-content li {
          margin-bottom: 0.5rem;
        }
        
        .blog-post-content p {
          margin-bottom: 1.5rem;
        }
        
        .blog-post-content strong {
          font-weight: 600;
          color: ${darkMode ? '#e5e7eb' : '#374151'};
        }
        
        .blog-post-content blockquote {
          border-left: 4px solid ${darkMode ? '#60a5fa' : '#3b82f6'};
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: ${darkMode ? '#d1d5db' : '#6b7280'};
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default BlogPostWithInfographics;