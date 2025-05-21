import React from 'react';
import { Link } from 'react-router-dom';
import ModuleCard from '@/components/docs/ModuleCard';
import useModules from '@/hooks/useModules';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Homepage component with introduction to @voilajsx/appkit
 */
function Home() {
  const modules = useModules();

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      
    {/* Hero section - Modern with Animated Gradient */}
    <div className="relative overflow-hidden py-6 pb-12  px-4">
    
    {/* Background gradient element */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 -z-10"></div>  
        {/* Animated gradient circles */}
        <div className="absolute top-0 left-0 right-0 bottom-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-40 -right-40 w-80 h-80 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-voila-purple/20 dark:bg-voila-purple/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
            {/* Logo or icon */}
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-voila-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            
            </div>
            
            {/* Main title */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 logo">
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-voila-blue via-blue-600 to-voila-purple">
                @voilajsx/appkit
            </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
            A minimal, framework-agnostic Node.js toolkit providing essential building blocks for modern applications.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/docs/getting-started" className="transform transition-all duration-300 px-8 py-4 bg-voila-blue text-white font-medium rounded-xl shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1">
                Get Started →
            </Link>
            <a href="https://github.com/voilajsx/appkit" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-xl shadow-lg hover:shadow-gray-300/60 dark:hover:shadow-gray-900/60 hover:-translate-y-1">
                <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                GitHub
                </span>
            </a>
            <a href="https://www.npmjs.com/package/@voilajsx/appkit" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-xl shadow-lg hover:shadow-gray-300/60 dark:hover:shadow-gray-900/60 hover:-translate-y-1">
                <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0v24h24v-24h-24zm13 21h-2v-9h-4v9h-4v-12h10v12zm8 0h-5v-6h2v3h1v-3h2v6z"></path>
                </svg>
                npm
                </span>
            </a>
            </div>
            
            {/* Badge stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                v1.0.0
            </span>
            <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                MIT License
            </span>
            <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Node.js 14+
            </span>
            </div>
        </div>
    </div>



      {/* Key features section */}
    <div className="my-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Key Principles</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
            Built with modern practices for real-world applications.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Minimal By Design</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Lightweight utilities with no bloat, optimized for performance.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors flex-shrink-0">
                    <span className="text-indigo-600 dark:text-indigo-400 text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Framework-Agnostic</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Works with any Node.js framework without lock-in.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 text-2xl">🧩</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Modular Architecture</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Import only what you need with focused, independent modules.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors flex-shrink-0">
                    <span className="text-cyan-600 dark:text-cyan-400 text-2xl">💪</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">First-Class TypeScript</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                TypeScript support with full type definitions for safer coding.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-teal-50 dark:bg-teal-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors flex-shrink-0">
                    <span className="text-teal-600 dark:text-teal-400 text-2xl">📘</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Good Documentation</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Clear, comprehensive docs with examples and best practices.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-red-50 dark:bg-red-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Security-Focused</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Secure coding practices with audited modules and safe defaults.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-green-50 dark:bg-green-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Comprehensively Tested</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Thoroughly tested with unit, integration, and edge case tests.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors flex-shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Production-Ready</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Battle-tested utilities for reliable, high-performance apps.
                </p>
            </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center mb-4">
                <div className="bg-violet-50 dark:bg-violet-900/30 rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors flex-shrink-0">
                    <span className="text-violet-600 dark:text-violet-400 text-2xl">🧠</span>
                </div>
                <h3 className="h3 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">AI-Enhanced</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                Optimized for LLMs with AI-specific guides for rapid development.
                </p>
            </div>
            </div>
        </div>
    </div>

     
    {/* Modules section */}
    <div className="mb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Modules Overview</h2>
            <div className="w-20 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mt-3 mb-6 rounded-full"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
            Our library consists of 13 independent modules, each focused on solving specific aspects of application development.
            </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key Methods</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/auth" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🔐</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Auth</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Authentication and authorization utilities</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-mono">generateToken</code>
                        <code className="inline-block text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-mono">verifyToken</code>
                        <code className="inline-block text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-mono">hashPassword</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/tenantdb" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🏢</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">TenantDB</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Multi-tenant database management</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-mono">createDb</code>
                        <code className="inline-block text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-mono">forTenant</code>
                        <code className="inline-block text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-mono">createTenant</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/cache" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">⚡</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Cache</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Caching with in-memory or Redis strategies</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md font-mono">createCache</code>
                        <code className="inline-block text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md font-mono">get</code>
                        <code className="inline-block text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md font-mono">set</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/events" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">📡</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Events</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Pub/sub event bus for decoupled communication</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-md font-mono">subscribe</code>
                        <code className="inline-block text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-md font-mono">publish</code>
                        <code className="inline-block text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-md font-mono">unsubscribe</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/security" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🛡️</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Security</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">CSRF protection, rate limiting, and sanitization</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-md font-mono">createCsrfMiddleware</code>
                        <code className="inline-block text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-md font-mono">createRateLimiter</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/error" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🚨</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Error</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Consistent error handling and formatting</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md font-mono">createError</code>
                        <code className="inline-block text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md font-mono">notFoundError</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/logging" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">📝</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Logging</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Structured logging with multiple transports</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-mono">createLogger</code>
                        <code className="inline-block text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-mono">info</code>
                        <code className="inline-block text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-mono">error</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/storage" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">💾</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Storage</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">File storage abstraction for local and cloud providers</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-md font-mono">initStorage</code>
                        <code className="inline-block text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-md font-mono">upload</code>
                        <code className="inline-block text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-md font-mono">download</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/email" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">📧</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Email</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Template-based email sending</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-md font-mono">initEmail</code>
                        <code className="inline-block text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-md font-mono">sendEmail</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/queue" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">⏱️</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Queue</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Background job processing</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-md font-mono">initQueue</code>
                        <code className="inline-block text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-md font-mono">addJob</code>
                        <code className="inline-block text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-md font-mono">processJob</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/config" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">⚙️</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Config</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Environment-based configuration management</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-md font-mono">loadConfig</code>
                        <code className="inline-block text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-md font-mono">getConfig</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/validation" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-lime-50 dark:bg-lime-900/30 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">✓</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Validation</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Schema-based data validation</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300 px-2 py-1 rounded-md font-mono">createValidator</code>
                        <code className="inline-block text-xs bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300 px-2 py-1 rounded-md font-mono">validate</code>
                    </div>
                    </td>
                </tr>
                
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href="/docs/utils" className="flex items-center group">
                        <div className="flex-shrink-0 w-9 h-9 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">🔧</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Utils</span>
                    </a>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">Helper functions for data manipulation and async tasks</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <code className="inline-block text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-mono">pick</code>
                        <code className="inline-block text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-mono">deepMerge</code>
                        <code className="inline-block text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-mono">retry</code>
                    </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
        
        <div className="text-center mt-8">
            <Link to="/docs/getting-started" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Explore all modules
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            </Link>
        </div>
    </div>

      {/* Why use section */}
      {/* Why use section */}
<div className="mb-16 px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl mx-auto text-center mb-10">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Use AppKit?</h2>
    <div className="w-20 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mt-3 mb-6 rounded-full"></div>
    <p className="text-lg text-gray-600 dark:text-gray-300">
      Build robust applications faster with production-ready utilities
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Card 1 */}
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-5 text-white shadow-sm group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Accelerate Development</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Stop reinventing common functionality</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Consistent API across all utilities</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Focus on business logic, not infrastructure</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Cut development time in half</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center mb-5 text-white shadow-sm group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Production-Ready</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Based on real-world usage patterns</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Optimized for performance and stability</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Secure by default implementation</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Battle-tested in high-traffic applications</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Card 3 */}
    <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center mb-5 text-white shadow-sm group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Developer Experience</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Comprehensive documentation with examples</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">First-class TypeScript support</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">Modular structure for picking what you need</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-500 mr-2">✓</span>
            <span className="text-gray-600 dark:text-gray-300">AI-optimized for code generation</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {/* Stats section */}
  <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">13</div>
      <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Modules</div>
    </div>
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
      <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Utility Functions</div>
    </div>
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</div>
      <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Test Coverage</div>
    </div>
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">2x</div>
      <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Development Speed</div>
    </div>
  </div>

  {/* Quote section */}
  <div className="mt-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="flex flex-col items-center text-center">
      <svg className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179m10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179" />
      </svg>
      <blockquote className="text-lg italic text-gray-600 dark:text-gray-300 max-w-4xl">
        AppKit has transformed how we build our applications. We’ve significantly sped up the development process while enhancing code quality and long-term maintainability.
      </blockquote>
      <div className="mt-4">
        <div className="font-medium text-gray-900 dark:text-white">Krishna Teja</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">CTO at Fresherbot</div>
      </div>
    </div>
  </div>
</div>

      
      
      
    </div>
  );
}

export default Home;