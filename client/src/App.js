import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import GrantsChatWidget from './components/GrantsChatWidget';
import ProtectedRoute from './components/ProtectedRoute';

// Import Contexts
import { LanguageContext } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Import styles
import './App.css';
import './styles/mobile-optimizations.css';
import './styles/video-hero.css';

// Import utilities
import { debugEnv } from './utils/debugEnv';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const GrantsPage = lazy(() => import('./pages/GrantsPage'));
const GrantDetail = lazy(() => import('./pages/GrantDetail'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy load Admin Components
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminGrants = lazy(() => import('./pages/AdminGrants'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminBlogEditor = lazy(() => import('./pages/AdminBlogEditorSimple')); // Using simplified version temporarily
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

// Lazy load Blog Components
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Lazy load Wizard Component
const GrantMatchingWizard = lazy(() => import('./components/GrantMatchingWizard'));

// Debug environment on load
debugEnv();

// Loader animation component
const LoadingAnimation = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50 transition-opacity duration-500">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 dark:border-blue-400 animate-spin"></div>
      <div
        className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-300 dark:border-blue-600 animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      ></div>
    </div>
  </div>
);

// Page loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 dark:border-blue-400 animate-spin"></div>
      <div
        className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-300 dark:border-blue-600 animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      ></div>
    </div>
  </div>
);

function App() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [loading, setLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageContext.Provider value={{ language, changeLanguage }}>
          {loading ? (
            <LoadingAnimation />
          ) : (
            <Routes>
              {/* Public routes with header/footer */}
              <Route
                path="/"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <HomePage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/grants"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <GrantsPage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/grants/:id"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <GrantDetail />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/grants/wizard"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <GrantMatchingWizard />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/about"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <AboutPage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/blog"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <BlogPage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <BlogPostPage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />

              {/* Old admin page redirect */}
              <Route
                path="/admin"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <AdminPage />
                      </Suspense>
                    </main>
                    <Footer />
                  </div>
                }
              />

              {/* Admin routes without header/footer */}
              <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminOverview /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense>} />
                <Route path="grants" element={<Suspense fallback={<PageLoader />}><AdminGrants /></Suspense>} />
                <Route path="blog" element={<Suspense fallback={<PageLoader />}><AdminBlog /></Suspense>} />
                <Route path="blog/new" element={<Suspense fallback={<PageLoader />}><AdminBlogEditor /></Suspense>} />
                <Route path="blog/edit/:id" element={<Suspense fallback={<PageLoader />}><AdminBlogEditor /></Suspense>} />
                {/* Removed routes for blog-generation and users - require Express server */}
                <Route path="profile" element={<Suspense fallback={<PageLoader />}><AdminProfile /></Suspense>} />
              </Route>

              <Route
                path="*"
                element={
                  <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Header />
                    <main id="main-content" className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <NotFoundPage />
                      </Suspense>
                    </main>
                    <Footer />
                    <GrantsChatWidget />
                  </div>
                }
              />
            </Routes>
          )}
        </LanguageContext.Provider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
