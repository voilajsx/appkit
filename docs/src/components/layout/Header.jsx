import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Header component for the @voilajsx/appkit documentation site
 * Includes logo, navigation links, search, and theme toggle
 * 
 * @param {Object} props - Component props
 * @param {Function} props.toggleSidebar - Function to toggle sidebar visibility
 * @param {boolean} props.sidebarOpen - Whether the sidebar is currently open
 * @param {boolean} props.showSidebar - Whether the sidebar should be shown for this page
 * @param {Array} props.searchIndex - Search index data for searching documentation
 */
function Header({ toggleSidebar, sidebarOpen, showSidebar, searchIndex = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  
  // Check initial theme preference
  useEffect(() => {
    // Check for saved preference or system preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(darkModePreference);
    applyTheme(darkModePreference);
    
    // Listen for scroll events to add shadow on scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open search modal with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Close search modal with Escape
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }

      // Handle navigation in search results with arrow keys
      if (isSearchOpen && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedResultIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedResultIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
          e.preventDefault();
          handleResultSelect(searchResults[selectedResultIndex]);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchResults, selectedResultIndex]);
  
  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedResultIndex(-1);
    }
  }, [isSearchOpen]);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = performSearch(searchQuery);
      setSearchResults(results);
      setSelectedResultIndex(-1);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  
  // Apply theme to document
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Perform search on the search index
  const performSearch = (query) => {
    if (!searchIndex || !query) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    // This is a simple search implementation
    // In a real app, you might want to use a library like Fuse.js for fuzzy search
    
    return searchIndex
      .filter(item => {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.content.toLowerCase().includes(normalizedQuery) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
        );
      })
      .slice(0, 10); // Limit to 10 results
  };

  // Handle search result selection
  const handleResultSelect = (result) => {
    setIsSearchOpen(false);
    if (result && result.url) {
      navigate(result.url);
    }
  };
  
  // Navigation links
  const navLinks = [
    { text: 'Home', href: '/' },
    { text: 'Docs', href: '/docs/getting-started' },
    { text: 'GitHub', href: 'https://github.com/voilajsx/appkit', external: true }
  ];

  // Group search results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    const category = result.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  return (
    <>
      <header 
        className={`sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-200 ${
          isScrolled ? 'shadow-sm border-b border-gray-200 dark:border-gray-800' : ''
        }`}
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + mobile menu button */}
            <div className="flex items-center ">
              {/* Sidebar toggle (only on doc pages) */}
              {showSidebar && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 mr-1.5 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              )}
              
              {/* Logo */}
              <Link to="/" className="group flex items-center">
                <div className="mr-3 flex-shrink-0 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                  <span className="text-gray-500 dark:text-gray-400 font-normal">@voilajsx</span>/appkit
                </span>
              </Link>
            </div>
            
            {/* Center: Navigation - desktop only */}
            <nav className="hidden md:flex items-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex">
                {navLinks.map((link, index) => {
                  const isActive = !link.external && location.pathname === link.href;
                  return link.external ? (
                    <a
                      key={link.text}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-1.5 text-sm font-medium rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${
                        index > 0 ? 'ml-1' : ''
                      }`}
                    >
                      {link.text}
                    </a>
                  ) : (
                    <Link
                      key={link.text}
                      to={link.href}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                        isActive 
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      } ${index > 0 ? 'ml-1' : ''}`}
                    >
                      {link.text}
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Right: Search + theme toggle */}
            <div className="flex items-center space-x-3">
              {/* Search button - desktop */}
              <div className="hidden md:block">
                <div className="relative">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 py-1.5 px-3 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Search
                    <span className="ml-4 text-xs bg-gray-200 dark:bg-gray-700 py-0.5 px-1.5 rounded">⌘K</span>
                  </button>
                </div>
              </div>
              
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 text-gray-500 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
              
              
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  className="p-1.5 text-gray-500 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Open mobile menu"
                  onClick={() => {
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                      mobileMenu.classList.toggle('hidden');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu - slide from top */}
        <div id="mobile-menu" className="hidden md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {navLinks.map((link) => {
              const isActive = !link.external && location.pathname === link.href;
              return link.external ? (
                <a
                  key={link.text}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {link.text}
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={link.text}
                  to={link.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                      mobileMenu.classList.add('hidden');
                    }
                  }}
                >
                  {link.text}
                </Link>
              );
            })}
            
            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <>
          {/* Modal backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setIsSearchOpen(false)}
          ></div>
          
          {/* Modal container */}
          <div className="fixed top-[20%] inset-x-0 mx-auto w-full max-w-2xl px-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      ESC
                    </kbd>
                  </div>
                </div>
              </div>
              
              {/* Search results */}
              <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Start typing to search...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg font-medium">No results found</p>
                    <p className="mt-1">Try adjusting your search terms</p>
                  </div>
                ) : (
                  Object.entries(groupedResults).map(([category, results]) => (
                    <div key={category}>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {category}
                        </h3>
                      </div>
                      <ul>
                        {results.map((result, index) => {
                          const isSelected = index === selectedResultIndex;
                          return (
                            <li key={result.id || index}>
                              <button
                                className={`block w-full text-left px-4 py-3 ${
                                  isSelected 
                                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                                onClick={() => handleResultSelect(result)}
                                onMouseEnter={() => setSelectedResultIndex(searchResults.indexOf(result))}
                              >
                                <div className={`font-medium ${
                                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                }`}>{result.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {result.excerpt || result.content.substring(0, 100)}...
                                </div>
                                {result.tags && result.tags.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {result.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>
              
              {/* Modal footer with keyboard shortcuts */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <span className="flex items-center">
                      <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">↑</kbd>
                      <kbd className="ml-1 px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">↓</kbd>
                      <span className="ml-1">to navigate</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">Enter</kbd>
                      <span className="ml-1">to select</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">Esc</kbd>
                      <span className="ml-1">to close</span>
                    </span>
                  </div>
                  <div>
                    <button 
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;