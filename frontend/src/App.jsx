import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

// Layout Components
import Navbar from './components/Navbar';
import Header from './components/Header';
import Footer from './components/Footer';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DashboardVehicle from './pages/DashboardVehicle';
import DashboardHealth from './pages/DashboardHealth';
import ClaimSubmission from './pages/ClaimSubmission';
import TruthAnalysisVehicle from './pages/TruthAnalysisVehicle';
import TruthAnalysisHealth from './pages/TruthAnalysisHealth';

import Assistant from './pages/Assistant';
import Architecture from './pages/Architecture';



/**
 * Global Toast Notification Component
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const newToast = { id: Date.now(), ...e.detail };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="fixed top-24 right-8 z-[100] flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl border backdrop-blur-md min-w-[300px] ${
              toast.type === 'error' 
                ? 'bg-danger/10 border-danger/30 text-danger' 
                : 'bg-success/10 border-success/30 text-success'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-3" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} className="ml-4 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const showToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
};


/**
 * App Component: Main container for the single-page application.
 */
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth State
  const [userName, setUserName] = useState(''); // Store user's name
  const [isDark, setIsDark] = useState(true); // Theme State
  const location = useLocation();

  // Handle responsive sidebar on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = (name) => {
    setUserName(name || 'User');
    setIsAuthenticated(true);
    showToast(`Welcome back, ${name || 'User'}!`, 'success');
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Successfully logged out.', 'success');
  };

  // Apply dark mode class to HTML root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Derive insurance type from URL path (e.g., /health/submit -> health)
  const pathParts = location.pathname.split('/');
  const insuranceType = (pathParts[1] === 'health' || pathParts[1] === 'vehicle') ? pathParts[1] : null;

  // If not authenticated, only show the Auth page
  if (!isAuthenticated) {
    return (
      <>
        <AnimatePresence mode="wait">
          <Routes location={location} key="auth">
            <Route path="/login" element={<Auth onLogin={handleLogin} isDark={isDark} toggleTheme={toggleTheme} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
        <ToastContainer />
      </>
    );
  }

  // Dashboard Layout for authenticated users
  return (
    <div className="flex min-h-screen bg-background text-zinc-200 selection:bg-primary/30 transition-colors duration-500 overflow-x-hidden">
      <ToastContainer />
      
      {/* Sidebar Navigation (Left) */}
      <Navbar isOpen={isSidebarOpen} toggle={toggleSidebar} insuranceType={insuranceType} />

      {/* Main Content Area (Right) */}
      <div className={`flex flex-col flex-1 transition-all duration-500 w-full ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Top Header */}
        <Header 
          userName={userName} 
          onLogout={handleLogout} 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          toggleSidebar={toggleSidebar}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 mt-4 md:mt-0">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageWrapper variant="slideUp">
                  <Dashboard selectedType={null} />
                </PageWrapper>
              } />
              
              {/* Dynamic typed routes for health/vehicle */}
              <Route path="/:type/dashboard" element={
                <PageWrapper variant="slideUp">
                  {insuranceType === 'health' ? (
                    <DashboardHealth />
                  ) : (
                    <DashboardVehicle />
                  )}
                </PageWrapper>
              } />
              <Route path="/:type/submit" element={
                <PageWrapper variant="slideRight">
                  <ClaimSubmission insuranceType={insuranceType} />
                </PageWrapper>
              } />
              <Route path="/:type/analysis" element={
                <PageWrapper variant="zoom">
                  {insuranceType === 'health' ? (
                    <TruthAnalysisHealth />
                  ) : (
                    <TruthAnalysisVehicle />
                  )}
                </PageWrapper>
              } />

              <Route path="/:type/assistant" element={
                <PageWrapper variant="slideUp">
                  <Assistant insuranceType={insuranceType} />
                </PageWrapper>
              } />
              <Route path="/:type/architecture" element={
                <PageWrapper variant="slideUp">
                  <Architecture />
                </PageWrapper>
              } />
              
              {/* Redirect any other path to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

/**
 * PageWrapper Helper: Provides consistent entry animations for routes.
 */
const PageWrapper = ({ children, variant }) => {
  const variants = {
    slideUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
    slideRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } },
    zoom: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.05 } },
    blur: { initial: { opacity: 0, filter: 'blur(10px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(10px)' } }
  };

  return (
    <motion.div
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default App;
