import React, { useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

// Custom light theme with more colorful syntax highlighting
const colorfullLightTheme = {
  plain: {
    color: '#24292e',
    backgroundColor: '#fff',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#6a737d',
        fontStyle: 'italic',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#22863a',
      },
    },
    {
      types: ['punctuation', 'operator'],
      style: {
        color: '#24292e',
      },
    },
    {
      types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'property', 'regex', 'inserted'],
      style: {
        color: '#005cc5',
      },
    },
    {
      types: ['atrule', 'keyword', 'attr-name', 'selector'],
      style: {
        color: '#d73a49',
      },
    },
    {
      types: ['function', 'deleted', 'tag'],
      style: {
        color: '#e36209',
      },
    },
    {
      types: ['function-variable'],
      style: {
        color: '#6f42c1',
      },
    },
    {
      types: ['tag', 'selector', 'keyword'],
      style: {
        color: '#0550ae',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
  ],
};

// Use direct theme imports from the themes object
const darkTheme = themes.vsDark;
const lightTheme = themes.github;//colorfullLightTheme; // Use our custom colorful light theme

/**
 * CodeBlock component for @voilajsx/appkit documentation site
 * Displays syntax-highlighted code blocks with copy functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.code - The code to display
 * @param {string} props.language - Programming language for syntax highlighting
 * @param {boolean} [props.showLineNumbers=false] - Whether to show line numbers
 * @param {boolean} [props.showCopyButton=true] - Whether to show copy button
 * @param {boolean} [props.showLanguageBadge=true] - Whether to show language badge
 * @param {string} [props.fileName] - Optional file name to display
 * @param {string} [props.className] - Additional CSS classes
 */
function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  showCopyButton = true,
  showLanguageBadge = true,
  fileName = null,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDarkNow);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  
  // Handle copying code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  // Map language names for better display
  const getLanguageLabel = (lang) => {
    const languageMap = {
      js: 'JavaScript',
      jsx: 'React',
      ts: 'TypeScript',
      tsx: 'React TSX',
      bash: 'Terminal',
      sh: 'Shell',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      md: 'Markdown',
      yml: 'YAML',
      yaml: 'YAML',
    };
    
    return languageMap[lang] || lang;
  };
  
  // Format code (trim trailing whitespace and ensure ends with newline)
  const formattedCode = code.trim() + (code.endsWith('\n') ? '' : '\n');
  
  // Detect language from className if not explicitly provided
  const detectedLanguage = language || 
    (className?.startsWith('language-') ? className.replace('language-', '') : 'text');
  
  return (
    <div className="code-block">
    <div className={`group relative my-6 rounded-lg overflow-hidden shadow-sm ${isDarkMode ? 'border border-gray-700' : 'border border-indigo-100'} ${className}`}>
      {/* Optional file name or language badge */}
      {(fileName || showLanguageBadge) && (
        <div className={`flex items-center justify-between px-4 py-2 ${
          isDarkMode 
            ? 'bg-gray-800 text-gray-200 border-b border-gray-700' 
            : 'bg-indigo-50 text-indigo-800 border-b border-indigo-100'
        }`}>
          {fileName && (
            <div className="text-sm font-mono">
              {fileName}
            </div>
          )}
          {showLanguageBadge && !fileName && (
            <div className={`text-xs font-medium uppercase tracking-wider ${
              isDarkMode ? 'text-gray-400' : 'text-indigo-600'
            }`}>
              {getLanguageLabel(detectedLanguage)}
            </div>
          )}
        </div>
      )}
      
      {/* Code block with syntax highlighting */}
      <Highlight
        theme={isDarkMode ? darkTheme : lightTheme}
        code={formattedCode}
        language={detectedLanguage}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre 
            className={`${className} overflow-x-auto py-4 text-sm`} 
            style={{ 
              ...style, 
              marginTop: 0,
              backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f9fc',
              borderRadius: 0
            }}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({ line, key: i })}
                className={`px-4 ${showLineNumbers ? 'pl-12 relative' : ''}`}
              >
                {showLineNumbers && (
                  <span className={`absolute left-0 px-4 select-none text-right w-8 ${
                    isDarkMode ? 'text-gray-500' : 'text-indigo-300'
                  }`}>
                    {i + 1}
                  </span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      
      {/* Copy button */}
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`absolute top-4 right-4 p-2 rounded-md transition-all ${
            copied 
              ? 'bg-green-500 text-white' 
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          } ${copied ? '' : 'opacity-0 group-hover:opacity-100'}`}
          aria-label="Copy code to clipboard"
          title="Copy code to clipboard"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
          )}
        </button>
      )}
    </div>
    </div>
  );
}

export default CodeBlock;