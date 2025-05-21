import { useState, useEffect } from "react";

/**
 * Hook to get the list of available modules in the @voilajsx/appkit library
 *
 * @returns {Array<{
 *   name: string,
 *   slug: string,
 *   description: string,
 *   icon: string,
 *   featured: boolean,
 *   docs: Array<{title: string, slug: string}>
 * }>} List of modules with their metadata
 */
function useModules() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    // In a production environment, this data would come from:
    // 1. An API endpoint returning module metadata
    // 2. A static JSON file generated at build time
    // 3. A dynamic import of module data

    // For this implementation, we'll use mock data
    const moduleData = [
      {
        name: "Auth",
        slug: "auth",
        description:
          "Secure authentication utilities including JWT tokens, password hashing, and middleware for route protection.",
        icon: "🔐",
        featured: true,
        docs: [
          { title: "API Reference", slug: "api-reference" },
          { title: "Examples", slug: "examples" },
        ],
        features: [
          "JWT Token Management",
          "Password Security",
          "Authentication Middleware",
          "Role-Based Access Control",
        ],
      },
      {
        name: "Logging",
        slug: "logging",
        description:
          "Structured logging system with multiple transports, log levels, and context management.",
        icon: "📊",
        featured: true,
        docs: [
          { title: "API Reference", slug: "api-reference" },
          { title: "Examples", slug: "examples" },
        ],
        features: [
          "Structured Logging",
          "Multiple Transports",
          "Log Levels",
          "Context Tracking",
        ],
      },
      {
        name: "Config",
        slug: "config",
        description:
          "Configuration management with environment variables, config files, and schema validation.",
        icon: "⚙️",
        featured: false,
        docs: [
          { title: "API Reference", slug: "api-reference" },
          { title: "Examples", slug: "examples" },
        ],
        features: [
          "Environment Variables",
          "Configuration Files",
          "Schema Validation",
          "Secure Secrets Management",
        ],
      },
      {
        name: "HTTP",
        slug: "http",
        description:
          "HTTP utilities for building and consuming APIs, including request handling and response formatting.",
        icon: "🌐",
        featured: false,
        docs: [
          { title: "API Reference", slug: "api-reference" },
          { title: "Examples", slug: "examples" },
        ],
        features: [
          "API Client",
          "Request Validation",
          "Response Formatting",
          "Error Handling",
        ],
      },
    ];

    setModules(moduleData);
  }, []);

  return modules;
}

export default useModules;
