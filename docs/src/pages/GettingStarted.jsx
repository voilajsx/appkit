import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Getting Started page for @voilajsx/appkit documentation
 * Features a sticky table of contents on the right side
 */
function GettingStarted() {
  const [activeSection, setActiveSection] = useState('installation');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['installation', 'basic-usage', 'module-imports', 'example-project', 'compatibility', 'next-steps'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle clicking on TOC links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Account for header
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main content area */}
      <div className="w-full lg:w-3/4  p-3 lg:pr-16">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Learn how to quickly integrate @voilajsx/appkit into your Node.js applications.
          </p>
        </div>

        {/* Installation section */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <p className="mb-4">
            Install @voilajsx/appkit using your preferred package manager:
          </p>
          
          {/* npm */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold mb-2">Using npm:</h3>
            <CodeBlock 
              code="npm install @voilajsx/appkit" 
              language="bash"
              showCopyButton={true}
            />
          </div>
          
          {/* yarn */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold mb-2">Using yarn:</h3>
            <CodeBlock 
              code="yarn add @voilajsx/appkit" 
              language="bash"
              showCopyButton={true}
            />
          </div>
          
          {/* pnpm */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold mb-2">Using pnpm:</h3>
            <CodeBlock 
              code="pnpm add @voilajsx/appkit" 
              language="bash"
              showCopyButton={true}
            />
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> @voilajsx/appkit requires Node.js version 14.0.0 or later.
            </p>
          </div>
        </section>

        {/* Basic Usage section */}
        <section id="basic-usage" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <p className="mb-4">
            Here's a simple example showing how to use @voilajsx/appkit modules in your application:
          </p>
          
          <CodeBlock 
            code={`import { auth, logging } from '@voilajsx/appkit';

// Initialize logger
const logger = logging.createLogger({
  level: 'info',
  pretty: process.env.NODE_ENV !== 'production'
});

// Generate a JWT token
const token = auth.generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: process.env.JWT_SECRET, expiresIn: '1d' }
);

logger.info({ token }, 'Generated authentication token');`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <p className="mt-4">
            The example above demonstrates importing two modules (<code>auth</code> and <code>logging</code>), 
            initializing a logger, and generating a JWT token.
          </p>
        </section>

        {/* Module Imports section */}
        <section id="module-imports" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Imports</h2>
          <p className="mb-4">
            @voilajsx/appkit is designed to be modular, allowing you to import only what you need.
            Here are different ways to import the modules:
          </p>
          
          {/* Import all modules */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">Import all modules:</h3>
            <CodeBlock 
              code={`import * as appkit from '@voilajsx/appkit';

const logger = appkit.logging.createLogger();
const token = appkit.auth.generateToken({ userId: '123' }, { secret: 'your-secret' });`} 
              language="javascript"
              showCopyButton={true}
            />
          </div>
          
          {/* Import specific modules */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">Import specific modules:</h3>
            <CodeBlock 
              code={`import { auth, logging, cache } from '@voilajsx/appkit';

const logger = logging.createLogger();
const token = auth.generateToken({ userId: '123' }, { secret: 'your-secret' });`} 
              language="javascript"
              showCopyButton={true}
            />
          </div>
          
          {/* Direct import */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">Direct module import (recommended for tree-shaking):</h3>
            <CodeBlock 
              code={`import { createLogger } from '@voilajsx/appkit/logging';
import { generateToken } from '@voilajsx/appkit/auth';

const logger = createLogger();
const token = generateToken({ userId: '123' }, { secret: 'your-secret' });`} 
              language="javascript"
              showCopyButton={true}
            />
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> For optimal bundle size in production applications, import modules directly from their paths as shown in the last example.
            </p>
          </div>
        </section>

        {/* Example Project section */}
        <section id="example-project" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Example Project</h2>
          <p className="mb-4">
            Here's a more complete example showing how to create a simple Express API with @voilajsx/appkit:
          </p>
          
          <CodeBlock 
            code={`import express from 'express';
import { auth, logging, error, validation, config } from '@voilajsx/appkit';

// Initialize app
const app = express();
app.use(express.json());

// Load configuration
config.loadConfig({
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: '7d'
  },
  server: {
    port: process.env.PORT || 3000
  }
});

// Create logger
const logger = logging.createLogger();

// Create validation schema
const userSchema = validation.createValidator({
  email: { type: 'string', format: 'email', required: true },
  password: { type: 'string', minLength: 8, required: true }
});

// Create error handler
const errorHandler = error.createErrorHandler({
  logger,
  formatError: (err) => ({
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
    status: err.status || 500
  })
});

// Create authentication middleware
const authenticate = auth.createAuthMiddleware({
  secret: config.getConfig('jwt.secret')
});

// Routes
app.post('/login', async (req, res, next) => {
  try {
    // Validate request body
    validation.validate(req.body, userSchema);
    
    // Authentication logic here...
    const user = { id: '123', email: req.body.email };
    
    // Generate token
    const token = auth.generateToken(
      { userId: user.id, email: user.email },
      { 
        secret: config.getConfig('jwt.secret'),
        expiresIn: config.getConfig('jwt.expiresIn')
      }
    );
    
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Protected route
app.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Error handling
app.use(error.notFoundHandler());
app.use(errorHandler);

// Start server
const port = config.getConfig('server.port');
app.listen(port, () => {
  logger.info({ port }, 'Server started');
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <p className="mt-4">
            This example demonstrates using multiple modules together to create a simple API with authentication, 
            validation, error handling, logging, and configuration management.
          </p>
        </section>

        {/* Compatibility section */}
        <section id="compatibility" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Framework Compatibility</h2>
          <p className="mb-4">
            @voilajsx/appkit is designed to be framework-agnostic and works seamlessly with popular Node.js frameworks:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold mb-2 text-xl flex items-center">
                <span className="mr-2">✅</span>
                Express
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Full compatibility with middleware support and Express-specific helpers.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold mb-2 text-xl flex items-center">
                <span className="mr-2">✅</span>
                Fastify
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works with Fastify's plugin system and request/reply model.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-xl mb-2 flex items-center">
                <span className="mr-2">✅</span>
                Koa
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Compatible with Koa's middleware pattern and context object.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold mb-2  text-xl flex items-center">
                <span className="mr-2">✅</span>
                NestJS
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Can be used within NestJS modules, services, and providers.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2">Framework-Specific Examples</h3>
            <ul className="space-y-2">
              <li>
                <a href="/docs/examples/express" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Express integration example
                </a>
              </li>
              <li>
                <a href="/docs/examples/fastify" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Fastify integration example
                </a>
              </li>
              <li>
                <a href="/docs/examples/koa" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Koa integration example
                </a>
              </li>
              <li>
                <a href="/docs/examples/nestjs" className="text-blue-600 dark:text-blue-400 hover:underline">
                  NestJS integration example
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* Next Steps section */}
        <section id="next-steps" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <p className="mb-4">
            Now that you understand the basics, explore these resources to dive deeper into @voilajsx/appkit:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Explore Modules</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Dive into each module's documentation to learn about all available features.
              </p>
              <Link to="/docs#modules" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View all modules
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Example Projects</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                See complete example projects that demonstrate real-world usage patterns.
              </p>
              <Link to="/docs/examples" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View examples
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">API Reference</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Explore the detailed API documentation for each module.
              </p>
              <Link to="/docs/api-reference" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View API reference
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">GitHub Repository</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                View the source code, report issues, or contribute to the project.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
              >
                Visit GitHub
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        
      </div>

      {/* TOC column */}
      <div className="hidden lg:block lg:w-1/4">
        <div className="sticky" style={{ top: "5rem" }}>
          <div className="">
            <div className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">On this page</div>
            <nav className="toc ">
              <ul className="space-y-2 text-sm p-0 m-0">
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('installation')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'installation' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Installation
                  </button>
                </li>
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('basic-usage')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'basic-usage' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Basic Usage
                  </button>
                </li>
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('module-imports')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'module-imports' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Module Imports
                  </button>
                </li>
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('example-project')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'example-project' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Example Project
                  </button>
                </li>
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('compatibility')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'compatibility' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Framework Compatibility
                  </button>
                </li>
                <li class="list-none">
                  <button 
                    onClick={() => scrollToSection('next-steps')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'next-steps' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Next Steps
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GettingStarted;