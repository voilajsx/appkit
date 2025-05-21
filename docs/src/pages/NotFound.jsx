import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

/**
 * 404 Not Found page component
 * Displayed when a user navigates to a non-existent route
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        {/* 404 Icon/Illustration */}
        <div className="mb-8 text-gray-400 dark:text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-32 h-32 mx-auto"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        {/* Error message */}
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            to="/" 
            variant="primary"
          >
            Go to Homepage
          </Button>
          
          <Button 
            to="/docs/getting-started" 
            variant="secondary"
          >
            View Documentation
          </Button>
        </div>
        
        {/* Helpful links */}
        <div className="mt-10 text-gray-600 dark:text-gray-400">
          <p className="mb-2">Looking for something specific?</p>
          <ul className="space-y-1">
            <li>
              <Link to="/docs/getting-started" className="text-voila-blue hover:underline dark:text-blue-400">
                Getting Started Guide
              </Link>
            </li>
            <li>
              <Link to="/docs/auth" className="text-voila-blue hover:underline dark:text-blue-400">
                Auth Module
              </Link>
            </li>
            <li>
              <Link to="/docs/logging" className="text-voila-blue hover:underline dark:text-blue-400">
                Logging Module
              </Link>
            </li>
            <li>
              <a 
                href="https://github.com/voilajsx/appkit/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-voila-blue hover:underline dark:text-blue-400"
              >
                Report an Issue
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NotFound;