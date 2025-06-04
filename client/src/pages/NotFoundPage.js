import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen py-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <h1 className={`text-6xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-800'} mb-4 transition-colors duration-300`}>404</h1>
      <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-700'} mb-6 transition-colors duration-300`}>{t('notFound.title', 'Page Not Found')}</h2>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md text-center mb-8 transition-colors duration-300`}>
        {t('notFound.message', 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.')}
      </p>
      <Link to="/" className={`flex items-center rounded-lg py-3 px-6 font-medium transition-all duration-200 ${darkMode 
        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
        {t('notFound.returnHome', 'Return to Home')}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default NotFoundPage;
