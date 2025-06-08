import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import GrantsChatWidget from './components/GrantsChatWidget';
import HomePage from './pages/HomePage';
import GrantsPage from './pages/GrantsPage';
import GrantDetail from './pages/GrantDetail';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Import Admin Components
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import AdminGrants from './pages/AdminGrants';
import AdminBlog from './pages/AdminBlog';
// import AdminBlogEditor from './pages/AdminBlogEditor';
import AdminBlogEditor from './pages/AdminBlogEditorSimple'; // Using simplified version temporarily
import AdminProfile from './pages/AdminProfile';
import AdminUsers from './pages/AdminUsers';
import AdminBlogGenerationDashboard from './pages/AdminBlogGenerationDashboard';
import AdminBlogGenerationCreate from './pages/AdminBlogGenerationCreate';
import ProtectedRoute from './components/ProtectedRoute';

// Import Blog Components
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

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

// Debug environment on load
debugEnv();

// Loader animation component
const LoadingAnimation = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50 transition-opacity duration-500">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 dark:border-blue-400 animate-spin"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-300 dark:border-blue-600 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
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

  const changeLanguage = (lng) => {
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
              <Route path="/" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <HomePage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              <Route path="/grants" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <GrantsPage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              <Route path="/grants/:id" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <GrantDetail />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              <Route path="/about" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <AboutPage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              <Route path="/blog" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow">
                    <BlogPage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              <Route path="/blog/:slug" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow">
                    <BlogPostPage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
              
              {/* Old admin page redirect */}
              <Route path="/admin" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <AdminPage />
                  </main>
                  <Footer />
                </div>
              } />
              
              {/* Admin routes without header/footer */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="grants" element={<AdminGrants />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/new" element={<AdminBlogEditor />} />
                <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                <Route path="blog-generation" element={<AdminBlogGenerationDashboard />} />
                <Route path="blog-generation/create" element={<AdminBlogGenerationCreate />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
              
              <Route path="*" element={
                <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
                    <NotFoundPage />
                  </main>
                  <Footer />
                  <GrantsChatWidget />
                </div>
              } />
            </Routes>
          )}
        </LanguageContext.Provider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
