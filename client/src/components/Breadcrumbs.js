import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const Breadcrumbs = ({ customItems = [] }) => {
  const { darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: t('breadcrumbs.home', 'Home'), path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map route segments to labels
      const labelMap = {
        'grants': t('breadcrumbs.grants', 'Grants'),
        'about': t('breadcrumbs.about', 'About'),
        'blog': t('breadcrumbs.blog', 'Blog'),
        'admin': t('breadcrumbs.admin', 'Admin'),
        'login': t('breadcrumbs.login', 'Login'),
        'dashboard': t('breadcrumbs.dashboard', 'Dashboard'),
        'profile': t('breadcrumbs.profile', 'Profile'),
        'overview': t('breadcrumbs.overview', 'Overview'),
      };

      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    // If custom items are provided, use them instead
    if (customItems.length > 0) {
      return [breadcrumbs[0], ...customItems];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on homepage
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav
      className={`
        flex items-center space-x-2 text-sm mb-6
        ${darkMode ? 'text-gray-400' : 'text-gray-600'}
      `}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {item.isLast || index === breadcrumbs.length - 1 ? (
            <span
              className={`font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className={`
                hover:underline transition-colors
                ${darkMode 
                  ? 'hover:text-gray-200' 
                  : 'hover:text-gray-900'
                }
              `}
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Structured data for SEO
export const BreadcrumbStructuredData = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: window.location.origin + item.path
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default Breadcrumbs;