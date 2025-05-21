import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar navigation component for the @voilajsx/appkit documentation
 * Shows navigation links for all documentation sections
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the sidebar is open (for mobile)
 * @param {Function} props.onClose - Function to close the sidebar
 * @param {string} props.currentModule - Current active module
 * @param {string} props.currentDoc - Current active document
 */
function Sidebar({ isOpen, onClose, currentModule, currentDoc }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({});
  
  // Set initial expanded state based on current module
  useEffect(() => {
    if (currentModule) {
      setExpanded(prev => ({
        ...prev,
        [currentModule]: true
      }));
    }
  }, [currentModule]);
  
  // Toggle a section's expanded state
  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Check if a link is active
  const isActive = (module, doc) => {
    if (!module && !doc) return false;
    
    if (module === 'general') {
      return currentModule === 'general' && currentDoc === doc;
    }
    
    if (!doc) {
      return currentModule === module && !currentDoc;
    }
    
    return currentModule === module && currentDoc === doc;
  };
  
  // General documentation items
  const generalDocs = [
    { title: 'Getting Started', slug: 'getting-started' },
    { title: 'Overview', slug: 'overview' }
  ];

  // Modules
  const modulesDocs = [
    { title: 'Auth', slug: 'auth' },
    { title: 'Cache', slug: 'cache' },
    { title: 'Config', slug: 'config' },
    { title: 'Logging', slug: 'logging' }
  ];
  
  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`fixed top-16 left-0 z-20 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform lg:translate-x-0 transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:sticky lg:top-16 lg:h-screen shadow-sm lg:shadow-none`} 
      style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Close button - mobile only */}
        <div className="flex justify-end p-2 lg:hidden">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar content - scrollable */}
        <div className="h-full overflow-y-auto py-6 px-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #F7FAFC' }}>
          {/* General section */}
          <div className="mb-8">
            <h3 className="px-3 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Getting Started
            </h3>
            <ul className="sidebar-list  pl-1">
              {generalDocs.map((doc) => (
                <li key={doc.slug} className="sidebar-list-item">
                  <Link
                    to={`/docs/${doc.slug}`}
                    className={`sidebar-link flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive('general', doc.slug)
                        ? 'active bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={onClose}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Module sections */}
          <div className="space-y-1">
            <h3 className="px-3 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Modules
            </h3>
            <ul className="sidebar-list  pl-1">
              {modulesDocs.map((doc) => (
                <li key={doc.slug} className="sidebar-list-item">
                  <Link
                    to={`/docs/${doc.slug}`}
                    className={`sidebar-link flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive('general', doc.slug)
                        ? 'active bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={onClose}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
           
          </div>
          
          {/* Version info */}
          <div className="sidebar-footer mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="px-3 flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="font-semibold mr-2">Version:</span>
                <span>1.0.0</span>
              </div>
              <a 
                href="https://github.com/voilajsx/appkit/releases" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sidebar-link text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                View releases
              </a>
            </div>
          </div>
        </div>
      </aside>

      
    </>
  );
}

export default Sidebar;