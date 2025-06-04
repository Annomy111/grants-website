import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const Footer = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${darkMode ? 'bg-gray-900 text-gray-300 border-t border-gray-800' : 'bg-white text-gray-600 border-t border-gray-200'} py-8 transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className={`mr-3 w-10 h-10 flex items-center justify-center rounded-full ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white font-bold text-xl`}>
                FHK
              </div>
              <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('appName')}
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4 max-w-xs`}>
              Helping civil society organizations find funding opportunities in Ukraine and internationally.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons - placeholder */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/fedo-hagge-kubat-36814415b/" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/grants" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {t('navigation.grants')}
                </Link>
              </li>
              <li>
                <Link to="/about" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {t('navigation.admin')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Contact
            </h3>
            <div className="mb-2">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fedo Hagge-Kubat
              </p>
            </div>
            <ul className="space-y-2">
              <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +49 174 403 1399
              </li>
              <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Prenlauer Alle 229, 10405 Berlin
              </li>
              <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <a 
                  href="https://www.linkedin.com/in/fedo-hagge-kubat-36814415b/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`}
                >
                  LinkedIn Profile
                </a>
              </li>
            </ul>
          </div>
          
          {/* Disclaimer */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Disclaimer
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
        
        <div className={`mt-8 pt-8 ${darkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
          <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; {currentYear} Fedo Hagge-Kubat - {t('appName')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
