import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * ModuleCard component for @voilajsx/appkit documentation site
 * Used for displaying module information on the home page and module listings
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Module title
 * @param {string} props.description - Short description of the module
 * @param {string} props.icon - Icon or emoji representing the module
 * @param {string} props.slug - Module slug for navigation
 * @param {Array<string>} [props.features] - List of key features (optional)
 * @param {Array<{title: string, slug: string}>} [props.docs] - List of module documentation pages (optional)
 * @param {boolean} [props.featured=false] - Whether this is a featured module with more prominent display
 * @param {string} [props.className] - Additional CSS classes
 */
function ModuleCard({
  title,
  description,
  icon,
  slug,
  features = [],
  docs = [],
  featured = false,
  className = '',
}) {
  return (
    <Card 
      className={`h-full ${featured ? 'border-blue-200 dark:border-blue-900' : ''} ${className}`}
      variant={featured ? 'primary' : 'default'}
      padding={featured ? 'lg' : 'md'}
      shadow={featured ? 'md' : 'sm'}
    >
      {/* Module header */}
      <div className="mb-4">
        <div className="flex items-center mb-3">
          {/* Icon */}
          <div className="text-3xl mr-3">
            {icon}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
      
      {/* Features list (if provided) */}
      {features.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Key Features
          </h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Documentation links (if provided) */}
      {docs.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Documentation
          </h4>
          <ul className="space-y-1">
            {docs.map((doc) => (
              <li key={doc.slug}>
                <a 
                  href={`/docs/${slug}/${doc.slug}`}
                  className="text-voila-blue hover:underline dark:text-blue-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path fillRule="evenodd" d="M11.097 1.515a.75.75 0 01.589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 111.47.294L16.665 7.5h3.585a.75.75 0 010 1.5h-3.885l-1.2 6h3.585a.75.75 0 010 1.5h-3.885l-1.08 5.397a.75.75 0 11-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 01-1.47-.294l1.02-5.103H3.75a.75.75 0 010-1.5h3.885l1.2-6H5.25a.75.75 0 010-1.5h3.885l1.08-5.397a.75.75 0 01.882-.588zM10.365 9l-1.2 6h4.47l1.2-6h-4.47z" clipRule="evenodd" />
                  </svg>
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-auto flex flex-wrap gap-3">
        <Button
          to={`/docs/${slug}`}
          variant="primary"
        >
          Explore {title}
        </Button>
        
        <Button
          to={`/docs/${slug}/api-reference`}
          variant="outline"
        >
          API Reference
        </Button>
      </div>
    </Card>
  );
}

export default ModuleCard;