import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

/**
 * Main layout wrapper for all pages in the @voilajsx/appkit documentation
 * Includes header, footer, and conditional sidebar based on route
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to be rendered
 */
function MainLayout({ children }) {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar visibility based on path
  useEffect(() => {
    // Show sidebar on documentation pages only
    setShowSidebar(location.pathname.includes('/docs'));
    // Close mobile sidebar on route change
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Extract current module and doc from path
  const getModuleAndDoc = () => {
    const path = location.pathname.split('/');
    if (path.length < 3) return { currentModule: null, currentDoc: null };
    
    // Handle paths like /docs/auth or /docs/auth/api-reference
    const module = path[2] === 'auth' || path[2] === 'logging' ? path[2] : 'general';
    const doc = path.length > 3 ? path[3] : path[2];
    
    return { currentModule: module, currentDoc: doc };
  };
  
  const { currentModule, currentDoc } = getModuleAndDoc();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} showSidebar={showSidebar} />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-grow pt-0">
        {/* Sidebar - only shown on doc pages */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            currentModule={currentModule}
            currentDoc={currentDoc}
          />
        )}
        
        {/* Main content area */}
        <main className={`flex-1 w-full transition-all duration-200`}>
          <div className="container px-0 md:px-4 py-4   mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && showSidebar && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default MainLayout;