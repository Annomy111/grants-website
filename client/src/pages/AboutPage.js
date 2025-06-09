import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const AboutPage = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`about-page ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-300 py-6`}
    >
      <div className="container mx-auto px-4">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          {t('about.title')}
        </h1>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8 transition-colors duration-300`}
        >
          <h2
            className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors duration-300`}
          >
            {t('about.purpose')}
          </h2>
          <p
            className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 text-lg leading-relaxed transition-colors duration-300`}
          >
            {t('about.purposeText')}
          </p>

          <div
            className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-500'} border-l-4 p-4 mb-6 transition-colors duration-300`}
          >
            <p
              className={`${darkMode ? 'text-blue-300' : 'text-blue-700'} transition-colors duration-300`}
            >
              This database includes grants from various international donors, governments, and
              organizations focused on supporting civil society initiatives in Ukraine and
              surrounding regions.
            </p>
          </div>

          <p
            className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-lg leading-relaxed transition-colors duration-300`}
          >
            We aim to make funding opportunities more accessible by presenting them in a structured,
            searchable format with comprehensive filtering options in both English and Ukrainian
            languages.
          </p>
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8 transition-colors duration-300`}
        >
          <h2
            className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors duration-300`}
          >
            {t('about.howToUse')}
          </h2>
          <p
            className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 text-lg leading-relaxed transition-colors duration-300`}
          >
            {t('about.howToUseText')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-colors duration-300`}
            >
              <div
                className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-4xl font-bold mb-2 transition-colors duration-300`}
              >
                1
              </div>
              <h3
                className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
              >
                Search
              </h3>
              <p
                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Use the search box to look for specific keywords related to your organization's
                work.
              </p>
            </div>

            <div
              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-colors duration-300`}
            >
              <div
                className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-4xl font-bold mb-2 transition-colors duration-300`}
              >
                2
              </div>
              <h3
                className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
              >
                Filter
              </h3>
              <p
                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Narrow down results by funding organization, country, focus area, grant amount, or
                deadline.
              </p>
            </div>

            <div
              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-colors duration-300`}
            >
              <div
                className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-4xl font-bold mb-2 transition-colors duration-300`}
              >
                3
              </div>
              <h3
                className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
              >
                Apply
              </h3>
              <p
                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Follow the links to official websites to read complete guidelines and submit
                applications.
              </p>
            </div>
          </div>

          <p
            className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-lg leading-relaxed transition-colors duration-300`}
          >
            The database is regularly updated to include the latest opportunities. Check back often
            or bookmark relevant grants to stay informed about upcoming deadlines.
          </p>
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 transition-colors duration-300`}
        >
          <h2
            className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors duration-300`}
          >
            {t('about.contact')}
          </h2>
          <p
            className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 text-lg leading-relaxed transition-colors duration-300`}
          >
            {t('about.contactText')}
          </p>

          <div
            className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg transition-colors duration-300`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3
                  className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
                >
                  Contact Person
                </h3>
                <p
                  className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300 font-medium`}
                >
                  Fedo Hagge-Kubat
                </p>
              </div>

              <div>
                <h3
                  className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
                >
                  Phone
                </h3>
                <p
                  className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}
                >
                  +49 174 403 1399
                </p>
              </div>

              <div>
                <h3
                  className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
                >
                  Address
                </h3>
                <p
                  className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}
                >
                  Prenlauer Alle 229, 10405 Berlin
                </p>
              </div>

              <div>
                <h3
                  className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}
                >
                  LinkedIn
                </h3>
                <p className={`transition-colors duration-300`}>
                  <a
                    href="https://www.linkedin.com/in/fedo-hagge-kubat-36814415b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`}
                  >
                    linkedin.com/in/fedo-hagge-kubat-36814415b
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
