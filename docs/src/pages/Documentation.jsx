import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getBreadcrumbs } from '@/utils/navigationUtils';

/**
 * Documentation page layout with breadcrumb navigation
 * Acts as a container for documentation content pages
 */
function Documentation() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  return (
    <div className="documentation-container">
      {/* Breadcrumb navigation */}
      <div className="">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                <a
                  href={crumb.href}
                  className={`ml-1 md:ml-2 text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-700 dark:text-gray-300 cursor-default pointer-events-none'
                      : 'text-voila-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  }`}
                  aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Main documentation content - rendered by child routes */}
      <div className="">
        <Outlet />
      </div>
      
   
      
      {/* Footer with version info */}
      <div className="mt-6 pt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            Version: 1.0.0 | Last updated: May 15, 2025
          </div>
          <div className="mt-2 md:mt-0">
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-voila-blue dark:text-blue-400 hover:underline"
            >
              MIT License
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentation;