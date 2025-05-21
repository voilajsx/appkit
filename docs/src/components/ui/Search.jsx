import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Search component for the @voilajsx/appkit documentation site
 * Provides search functionality with keyboard navigation and search results
 */
function Search() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Mock search data - in a real implementation, this would come from a search API or content index
  const searchIndex = [
    { title: 'Getting Started', path: '/docs/getting-started', module: 'general' },
    { title: 'Installation Guide', path: '/docs/installation', module: 'general' },
    { title: 'Contributing to AppKit', path: '/docs/contributing', module: 'general' },
    { title: 'Auth Module Overview', path: '/docs/auth', module: 'auth' },
    { title: 'JWT Token Management', path: '/docs/auth/api-reference#jwt-token-management', module: 'auth' },
    { title: 'Password Security', path: '/docs/auth/api-reference#password-security', module: 'auth' },
    { title: 'Authentication Middleware', path: '/docs/auth/api-reference#authentication-middleware', module: 'auth' },
    { title: 'Auth Examples', path: '/docs/auth/examples', module: 'auth' },
    { title: 'Logging Module Overview', path: '/docs/logging', module: 'logging' },
    { title: 'Logging Configuration', path: '/docs/logging/api-reference#configuration', module: 'logging' },
    { title: 'Structured Logging', path: '/docs/logging/api-reference#structured-logging', module: 'logging' },
    { title: 'Logging Examples', path: '/docs/logging/examples', module: 'logging' },
  ];
  
  // Search function
  const performSearch = (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = searchIndex.filter((item) => 
      item.title.toLowerCase().includes(lowerTerm) || 
      item.module.toLowerCase().includes(lowerTerm)
    );
    
    setResults(filtered.slice(0, 8)); // Limit results to 8 items
    setSelectedIndex(0); // Reset selection to first item
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    performSearch(newTerm);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // If no results, nothing to navigate
    if (results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results.length > 0) {
          navigateToResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
      default:
        break;
    }
  };
  
  // Navigate to a search result
  const navigateToResult = (result) => {
    navigate(result.path);
    closeSearch();
  };
  
  // Close search and reset
  const closeSearch = () => {
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };
  
  // Handle clicks outside to close search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen && 
        inputRef.current && 
        resultsRef.current && 
        !inputRef.current.contains(e.target) && 
        !resultsRef.current.contains(e.target)
      ) {
        closeSearch();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Add keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Search button/input */}
      <div 
        className={`flex items-center w-full sm:w-auto bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md ${isOpen ? 'rounded-b-none border-b-0' : ''}`}
      >
        {/* Search icon */}
        <div className="flex items-center justify-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search docs..."
          className="w-full py-2 px-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-700 dark:text-gray-300"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        
        {/* Keyboard shortcut display */}
        {!isOpen && (
          <div className="hidden sm:flex items-center pr-3">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded">
              ⌘K
            </kbd>
          </div>
        )}
      </div>
      
      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 left-0 right-0 mt-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-md shadow-lg overflow-hidden max-h-80 overflow-y-auto"
        >
          <ul>
            {results.map((result, index) => (
              <li 
                key={result.path}
                className={`cursor-pointer ${
                  selectedIndex === index 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => navigateToResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.module === 'general' ? 'General' : `${result.module.charAt(0).toUpperCase() + result.module.slice(1)} Module`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No results message */}
      {isOpen && searchTerm && results.length === 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 left-0 right-0 mt-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-md shadow-lg overflow-hidden"
        >
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <p>No results found for "{searchTerm}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;