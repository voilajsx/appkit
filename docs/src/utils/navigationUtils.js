import useModules from '@/hooks/useModules';

/**
 * Utilities for navigation and route generation
 */

/**
 * Generate sidebar navigation structure from module content
 * @returns {Array<Object>} Navigation structure
 */
export function generateNavigation() {
  // In a production environment, this would:
  // 1. Read the file system to find all documentation files
  // 2. Parse metadata from each file
  // 3. Sort and organize into a navigation structure

  // For this implementation, we'll use a static structure
  return [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', path: '/docs/getting-started' },
        { title: 'Installation', path: '/docs/installation' },
        { title: 'Contributing', path: '/docs/contributing' },
      ],
    },
    {
      title: 'Auth Module',
      items: [
        { title: 'Overview', path: '/docs/auth' },
        { title: 'API Reference', path: '/docs/auth/api-reference' },
        { title: 'Examples', path: '/docs/auth/examples' },
      ],
    },
    {
      title: 'Logging Module',
      items: [
        { title: 'Overview', path: '/docs/logging' },
        { title: 'API Reference', path: '/docs/logging/api-reference' },
        { title: 'Examples', path: '/docs/logging/examples' },
      ],
    },
  ];
}

/**
 * Get breadcrumb items for current path
 * @param {string} path - Current path
 * @returns {Array<{label: string, href: string}>} Breadcrumb items
 */
export function getBreadcrumbs(path) {
  if (!path || path === '/') {
    return [{ label: 'Home', href: '/appkit/' }];
  }

  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/appkit/' }];

  let currentPath = '/appkit';

  // Build breadcrumbs based on path parts
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentPath += `/${part}`;

    // Skip 'docs' in the label but keep it in the path
    if (part === 'docs' && i === 0) {
      breadcrumbs.push({ label: 'Documentation', href: currentPath });
      continue;
    }

    // Get appropriate label for this part
    const label = getBreadcrumbLabel(part, currentPath, parts.slice(0, i));
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

/**
 * Get appropriate label for breadcrumb
 * @param {string} part - Path part
 * @param {string} fullPath - Full path up to this part
 * @param {Array<string>} previousParts - Previous path parts
 * @returns {string} User-friendly label
 */
function getBreadcrumbLabel(part, fullPath, previousParts) {
  // Module-specific handling
  if (
    previousParts.includes('docs') &&
    !previousParts.includes('auth') &&
    !previousParts.includes('logging')
  ) {
    // This is a module name
    switch (part) {
      case 'auth':
        return 'Auth Module';
      case 'logging':
        return 'Logging Module';
      default:
        break;
    }
  }

  // Doc-specific handling
  switch (part) {
    case 'api-reference':
      return 'API Reference';
    case 'getting-started':
      return 'Getting Started';
    default:
      // Capitalize each word
      return part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

/**
 * Get the previous and next pages for a given page
 * @param {string} moduleName - Current module
 * @param {string} docName - Current document
 * @returns {Object} Object containing { prev, next } navigation links
 */
export function getPageNavigation(moduleName, docName) {
  const navigation = generateNavigation();
  const allPages = navigation.flatMap((section) => section.items);

  // Determine current path
  let currentPath = '';
  if (moduleName === 'general') {
    currentPath = `/docs/${docName}`;
  } else {
    currentPath = docName
      ? `/docs/${moduleName}/${docName}`
      : `/docs/${moduleName}`;
  }

  // Find current page index
  const currentIndex = allPages.findIndex((page) => page.path === currentPath);
  if (currentIndex === -1) return { prev: null, next: null };

  // Get previous and next pages
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next =
    currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return { prev, next };
}

/**
 * Get module data by slug
 * @param {string} slug - Module slug
 * @returns {Object|null} Module data or null if not found
 */
export function getModuleBySlug(slug) {
  const modules = useModules();
  return modules.find((module) => module.slug === slug) || null;
}

/**
 * Check if a path is active or parent of current path
 * @param {string} path - Path to check
 * @param {string} currentPath - Current active path
 * @returns {Object} Object with { isActive, isParent } booleans
 */
export function isActivePath(path, currentPath) {
  const isActive = path === currentPath;
  const isParent =
    currentPath.startsWith(path) && path !== currentPath && path !== '/';

  return { isActive, isParent };
}

/**
 * Get all documentation categories and pages
 * Used for search and sitemap generation
 * @returns {Array<Object>} Array of all pages with metadata
 */
export function getAllPages() {
  // This would typically read from a data source
  // For now, we'll generate based on our known structure

  const generalPages = [
    {
      title: 'Getting Started',
      path: '/docs/getting-started',
      description: 'Quick introduction to @voilajsx/appkit',
      category: 'General',
    },
    {
      title: 'Installation',
      path: '/docs/installation',
      description: 'Detailed installation instructions',
      category: 'General',
    },
    {
      title: 'Contributing',
      path: '/docs/contributing',
      description: 'Guidelines for contributing to @voilajsx/appkit',
      category: 'General',
    },
  ];

  const authPages = [
    {
      title: 'Auth Module',
      path: '/docs/auth',
      description: 'Authentication utilities for Node.js applications',
      category: 'Auth',
    },
    {
      title: 'API Reference',
      path: '/docs/auth/api-reference',
      description: 'Complete API documentation for the Auth module',
      category: 'Auth',
    },
    {
      title: 'Examples',
      path: '/docs/auth/examples',
      description: 'Usage examples for the Auth module',
      category: 'Auth',
    },
  ];

  const loggingPages = [
    {
      title: 'Logging Module',
      path: '/docs/logging',
      description: 'Structured logging system for Node.js applications',
      category: 'Logging',
    },
    {
      title: 'API Reference',
      path: '/docs/logging/api-reference',
      description: 'Complete API documentation for the Logging module',
      category: 'Logging',
    },
    {
      title: 'Examples',
      path: '/docs/logging/examples',
      description: 'Usage examples for the Logging module',
      category: 'Logging',
    },
  ];

  return [...generalPages, ...authPages, ...loggingPages];
}
