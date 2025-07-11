import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const Header = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useContext(LanguageContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Check if link is active
  const isActive = path => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        {t('skipToMain', 'Skip to main content')}
      </a>
      
      <header
        className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} 
          ${scrolled ? 'shadow-lg' : 'shadow-md'} 
          sticky top-0 z-30 transition-all duration-300 ease-in-out`}
        role="banner"
      >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" aria-label={t('homePageLink', 'Go to homepage')}>
              <img
                src="/images/ukraine-civil-society-logo.svg"
                alt="Ukrainian Civil Society Grants Database"
                className="h-12 w-auto mr-3"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label={t('mainNavigation', 'Main navigation')}>
            {[
              { path: '/', label: t('navigation.home') },
              { path: '/grants', label: t('navigation.grants') },
              { path: '/blog', label: t('navigation.blog', 'Blog') },
              { path: '/about', label: t('navigation.about') },
              { path: '/admin', label: t('navigation.admin') },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                  ${
                    isActive(item.path)
                      ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'}`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative ml-3 border-l border-gray-300 dark:border-gray-700 pl-3 flex items-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded text-sm transition-colors duration-200 ${
                    language === 'en'
                      ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                      : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`
                  }`}
                >
                  {t('languages.en')}
                </button>
                <span className={`${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
                <button
                  onClick={() => changeLanguage('uk')}
                  className={`px-2 py-1 rounded text-sm transition-colors duration-200 ${
                    language === 'uk'
                      ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                      : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`
                  }`}
                >
                  {t('languages.uk')}
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Language Switcher - Always Visible */}
            <div className="flex items-center space-x-1 text-sm">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded ${
                  language === 'en'
                    ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                    : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <span className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} text-xs`}>|</span>
              <button
                onClick={() => changeLanguage('uk')}
                className={`px-2 py-1 rounded ${
                  language === 'uk'
                    ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                    : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`
                }`}
                aria-label="Switch to Ukrainian"
              >
                UK
              </button>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              data-testid="mobile-menu-button"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}
        id="mobile-menu"
      >
        <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {[
            { path: '/', label: t('navigation.home') },
            { path: '/grants', label: t('navigation.grants') },
            { path: '/blog', label: t('navigation.blog', 'Blog') },
            { path: '/about', label: t('navigation.about') },
            { path: '/admin', label: t('navigation.admin') },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.path)
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'}`
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Language Selector for Mobile */}
          <div className="flex items-center space-x-2 px-3 py-2 border-t border-gray-300 dark:border-gray-700 mt-2 pt-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('languages')}
            </span>
            <button
              onClick={() => {
                changeLanguage('en');
                setMobileMenuOpen(false);
              }}
              className={`px-2 py-1 rounded text-sm transition-colors duration-200 ${
                language === 'en'
                  ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                  : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`
              }`}
            >
              {t('languages.en')}
            </button>
            <button
              onClick={() => {
                changeLanguage('uk');
                setMobileMenuOpen(false);
              }}
              className={`px-2 py-1 rounded text-sm transition-colors duration-200 ${
                language === 'uk'
                  ? `${darkMode ? 'bg-gray-800 text-white font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`
                  : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`
              }`}
            >
              {t('languages.uk')}
            </button>
          </div>
        </div>
      </div>
      </header>
    </>
  );
};

export default Header;
