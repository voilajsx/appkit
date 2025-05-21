import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AppRouter from '@/routes'; // Import your router component

/**
 * Main App component for @voilajsx/appkit documentation site
 * Handles routing configuration and global effects
 */
function App() {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
}

export default App;