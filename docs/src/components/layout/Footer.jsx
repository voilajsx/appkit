import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for the @voilajsx/appkit documentation site
 * Contains links, copyright information, and additional resources
 */
function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Footer link sections
  const footerSections = [
    {
      title: 'Documentation',
      links: [
        { text: 'Getting Started', href: '/docs/getting-started' },
        { text: 'Installation', href: '/docs/installation' },
        { text: 'Auth Module', href: '/docs/auth' },
        { text: 'Logging Module', href: '/docs/logging' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { text: 'GitHub', href: 'https://github.com/voilajsx/appkit', external: true },
        { text: 'NPM Package', href: 'https://www.npmjs.com/package/@voilajsx/appkit', external: true },
        { text: 'Contributing', href: '/docs/contributing' },
        { text: 'Release Notes', href: 'https://github.com/voilajsx/appkit/releases', external: true },
      ]
    },
    {
      title: 'Community',
      links: [
        { text: 'Discord', href: 'https://discord.gg/voilajsx', external: true },
        { text: 'Twitter', href: 'https://twitter.com/voilajsx', external: true },
        { text: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/voilajsx-appkit', external: true },
        { text: 'Report an Issue', href: 'https://github.com/voilajsx/appkit/issues', external: true },
      ]
    },
  ];
  
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        {/* CTA section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 p-12  shadow-md">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Better Apps?</h2>
        <p className="text-white text-xl mb-8 max-w-3xl mx-auto">
          Start using @voilajsx/appkit today and focus on what makes your application unique.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/docs/getting-started" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors">
            Get Started
          </Link>
          <a href="https://github.com/voilajsx/appkit" target="_blank" rel="noopener noreferrer" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            View on GitHub
          </a>
        </div>
      </div>
      <div className="container-padding mx-auto py-4 pb-8">
        {/* Bottom section with logo, copyright and message */}
        <div className="pt-6 pb-10 border-gray-200 dark:border-gray-800">
          <div className="flex justify-center items-center">
            
            
            {/* Copyright notice */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Built with <span className="text-red-500">❤</span> in India by the{' '}
              <a 
                href="https://github.com/orgs/voilajsx/people" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-voila-blue dark:text-voila-purple hover:underline"
              >
                VoilaJSX Team
              </a>{' '}
              — powering modern web development.
            </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;