import React, { useState, useEffect } from 'react';

/**
 * TableOfContents component for @voilajsx/appkit documentation site
 * Displays a navigation menu of headings from the current page
 * Includes active state highlighting and smooth scrolling
 * 
 * @param {Object} props - Component props
 * @param {Array<{id: string, text: string, level: number}>} props.headings - List of page headings
 * @param {string} [props.className] - Additional CSS classes
 */
function TableOfContents({ headings, className = '' }) {
  const [activeId, setActiveId] = useState('');
  
  // Set up intersection observer to track which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Get all entries that are currently intersecting
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        // If there are intersecting entries, set the active ID to the first one
        if (intersectingEntries.length > 0) {
          // Use the heading that's highest up in the page (smallest y value)
          const sortedEntries = [...intersectingEntries].sort(
            (a, b) => a.boundingClientRect.y - b.boundingClientRect.y
          );
          const highestEntry = sortedEntries[0];
          setActiveId(highestEntry.target.id);
        }
      },
      // Only consider a heading in view if it's at least 20% visible
      { rootMargin: '0px 0px -80% 0px', threshold: 0.2 }
    );
    
    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
    
    // Clean up observer when component unmounts
    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);
  
  // Handle click on a table of contents item
  const handleClick = (e, id) => {
    e.preventDefault();
    
    const element = document.getElementById(id);
    if (element) {
      // Scroll to element with smooth behavior
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      
      // Update URL hash
      window.history.pushState(null, null, `#${id}`);
    }
  };
  
  // If no headings, don't render
  if (headings.length === 0) {
    return null;
  }
  
  return (
    <nav className={`toc ${className}`} aria-label="Table of contents">
      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        On this page
      </div>
      
      <ul className="space-y-1 text-sm">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={`toc-item toc-level-${level}`}>
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className={`
                block py-1 pl-${(level - 1) * 3} transition-colors
                ${activeId === id
                  ? 'text-voila-blue dark:text-blue-400 font-medium'
                  : 'text-gray-600 hover:text-voila-blue dark:text-gray-400 dark:hover:text-blue-400'
                }
              `}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;