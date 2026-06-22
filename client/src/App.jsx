import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SmartResumeAnalyzer from './pages/SmartResumeAnalyzer';
import TechInterviewPractice from './pages/TechInterviewPractice';
import ResumeBasedInterview from './pages/ResumeBasedInterview';
import TechBuddy from './pages/TechBuddy';
import { ToastProvider } from './context/ToastContext';

// Helper component to handle auto-scrolling to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          {/* Top fixed navbar */}
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Left fixed sidebar */}
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          {/* Main content pane */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resume-analyzer" element={<SmartResumeAnalyzer />} />
              <Route path="/tech-interview" element={<TechInterviewPractice />} />
              <Route path="/resume-interview" element={<ResumeBasedInterview />} />
              <Route path="/tech-buddy" element={<TechBuddy />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}
