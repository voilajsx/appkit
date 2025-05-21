import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TableOfContents from '@/components/docs/TableOfContents';
import Button from '@/components/ui/Button';
import useDocContent from '@/hooks/useDocContent';
import useTableOfContents from '@/hooks/useTableOfContents';
import { getPageNavigation } from '@/utils/navigationUtils';
import { calculateReadingTime } from '@/utils/markdownUtils';

/**
 * Documentation page component that renders markdown content
 * 
 * @param {Object} props - Component props
 * @param {string} props.module - Module name/slug (e.g., 'auth', 'logging', 'general')
 * @param {string} props.doc - Document name/slug (e.g., 'api-reference', 'examples')
 */
function DocPage({ module: propModule, doc: propDoc }) {
  const params = useParams();
  const module = propModule || params.module;
  const doc = propDoc || params.doc;
  
  const { content, metadata, isLoading, error } = useDocContent(module, doc);
  const headings = useTableOfContents(content);
  const { prev, next } = getPageNavigation(module, doc);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(content);
  
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [module, doc]);
  
  // Scroll to hash if present
  useEffect(() => {
    if (window.location.hash && !isLoading) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isLoading, content]);
  
  // Update document title
  useEffect(() => {
    if (metadata.title) {
      document.title = `${metadata.title} | @voilajsx/appkit Documentation`;
    } else {
      document.title = '@voilajsx/appkit Documentation';
    }
  }, [metadata]);
  
  // Error state
  if (error) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Documentation Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the requested documentation could not be found.
        </p>
        <Button to="/docs/getting-started" variant="primary">
          Back to Documentation
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="doc-page">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Metadata */}
          {metadata.title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {metadata.title}
              </h1>
              {metadata.description && (
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  {metadata.description}
                </p>
              )}
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {readingTime > 0 && (
                  <span className="mr-4">{readingTime} min read</span>
                )}
                {metadata.author && (
                  <span className="mr-4">By {metadata.author}</span>
                )}
                {metadata.lastUpdated && (
                  <span>Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Documentation content */}
          {content && (
            <div className="prose prose-blue dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          
          {/* Previous/Next navigation */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              {prev && (
                <div className="mb-4 sm:mb-0">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Previous
                  </span>
                  <Link
                    to={prev.path}
                    className="text-voila-blue hover:underline dark:text-blue-400 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    {prev.title}
                  </Link>
                </div>
              )}
              
              {next && (
                <div className="text-right ml-auto">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Next
                  </span>
                  <Link
                    to={next.path}
                    className="text-voila-blue hover:underline dark:text-blue-400 flex items-center justify-end"
                  >
                    {next.title}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
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
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Table of contents sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            {headings.length > 0 && (
              <TableOfContents headings={headings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocPage;