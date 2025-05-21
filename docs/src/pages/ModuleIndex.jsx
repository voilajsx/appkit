import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CodeBlock from '@/components/ui/CodeBlock';
import useModules from '@/hooks/useModules';
import useDocContent from '@/hooks/useDocContent';

/**
 * Module index page showing overview and links to module documentation
 * 
 * @param {Object} props - Component props
 * @param {string} [props.module] - Module name/slug (can also come from URL params)
 */
function ModuleIndex({ module: propModule }) {
  const params = useParams();
  const moduleSlug = propModule || params.module;
  const modules = useModules();
  const [moduleData, setModuleData] = useState(null);
  const { content, metadata, isLoading, error } = useDocContent(moduleSlug, null);
  
  // Find module data from the modules list
  useEffect(() => {
    if (modules.length > 0 && moduleSlug) {
      const foundModule = modules.find(m => m.slug === moduleSlug);
      if (foundModule) {
        setModuleData(foundModule);
      }
    }
  }, [modules, moduleSlug]);
  
  // If module not found, show error
  if (!isLoading && (!moduleData || error)) {
    return (
      <div className="py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Module Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the module "{moduleSlug}" could not be found.
        </p>
        <Button to="/docs/getting-started" variant="primary">
          Back to Documentation
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading || !moduleData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Get sample code for this module (if available)
  const getSampleCode = () => {
    switch (moduleSlug) {
      case 'auth':
        return `import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Verify a token
const payload = verifyToken(token, { secret: 'your-secret-key' });
console.log(payload.userId); // '123'`;
      case 'logging':
        return `import { createLogger } from '@voilajsx/appkit/logging';

// Create a logger
const logger = createLogger({
  name: 'my-app',
  level: 'info',
  transports: ['console']
});

// Basic logging
logger.info('Application started');
logger.warn('Deprecated feature used', { feature: 'oldApi' });
logger.error('Failed to connect to database', { error: err });`;
      default:
        return `import { ... } from '@voilajsx/appkit/${moduleSlug}';

// See the documentation for usage examples`;
    }
  };

  return (
    <div>
      {/* Module header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">{moduleData.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {moduleData.name} Module
          </h1>
        </div>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {moduleData.description}
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button to={`/docs/${moduleSlug}/api-reference`} variant="primary">
            API Reference
          </Button>
          <Button to={`/docs/${moduleSlug}/examples`} variant="secondary">
            Examples
          </Button>
          <Button href={`https://github.com/voilajsx/appkit/tree/main/src/${moduleSlug}`} variant="outline">
            View Source
          </Button>
        </div>
      </div>
      
      {/* Sample code */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Quick Example
        </h2>
        <Card padding="none" className="overflow-hidden">
          <CodeBlock
            code={getSampleCode()}
            language="javascript"
            showLineNumbers={true}
            showCopyButton={true}
          />
        </Card>
      </div>
      
      {/* Features grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleData.features.map((feature, index) => (
            <Card key={index} padding="md" className="h-full">
              <div className="flex items-start">
                <div className="mr-3 pt-0.5 text-voila-blue dark:text-voila-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Documentation content */}
      {content && (
        <div className="prose prose-blue dark:prose-invert max-w-none mt-8" 
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      
      {/* Documentation links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md" bordered={true} hover={true}>
          <h3 className="text-lg font-semibold mb-2">API Reference</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Comprehensive documentation of all functions, parameters, and return values.
          </p>
          <Button to={`/docs/${moduleSlug}/api-reference`} variant="secondary" className="w-full">
            View API Reference
          </Button>
        </Card>
        
        <Card padding="md" bordered={true} hover={true}>
          <h3 className="text-lg font-semibold mb-2">Usage Examples</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Practical examples and code snippets demonstrating common use cases.
          </p>
          <Button to={`/docs/${moduleSlug}/examples`} variant="secondary" className="w-full">
            View Examples
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default ModuleIndex;