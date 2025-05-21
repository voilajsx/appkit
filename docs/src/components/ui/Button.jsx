import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Button component for @voilajsx/appkit documentation site
 * Supports various styles, sizes, and can render as a button or link
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [props.variant='primary'] - Button style variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.to] - Link destination (internal route)
 * @param {string} [props.href] - Link destination (external URL)
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {boolean} [props.fullWidth] - Whether the button should take full width
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @param {Object} props.rest - Additional props passed to button/link element
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  to,
  href,
  disabled = false,
  fullWidth = false,
  type = 'button',
  ...rest
}) {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'text-white bg-voila-blue hover:bg-blue-700 focus:ring-blue-500 shadow-sm disabled:bg-blue-300 dark:disabled:bg-blue-800',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-400 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-600',
    outline: 'text-voila-blue bg-transparent border border-voila-blue hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800 disabled:text-blue-300 disabled:border-blue-300 disabled:hover:bg-transparent dark:disabled:text-blue-800 dark:disabled:border-blue-800',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 disabled:text-gray-300 disabled:hover:bg-transparent dark:disabled:text-gray-700',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm disabled:bg-red-300 dark:disabled:bg-red-800',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size] || sizeClasses.md} 
    ${variantClasses[variant] || variantClasses.primary}
    ${widthClasses}
    ${className}
  `;
  
  // If "to" is provided, render as an internal Link
  if (to && !disabled) {
    return (
      <Link to={to} className={buttonClasses} {...rest}>
        {children}
      </Link>
    );
  }
  
  // If "href" is provided, render as an external link
  if (href && !disabled) {
    return (
      <a 
        href={href} 
        className={buttonClasses} 
        target={rest.target || '_blank'} 
        rel={rest.rel || 'noopener noreferrer'} 
        {...rest}
      >
        {children}
      </a>
    );
  }
  
  // Otherwise, render as a button
  return (
    <button 
      type={type} 
      className={buttonClasses} 
      onClick={onClick} 
      disabled={disabled} 
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;