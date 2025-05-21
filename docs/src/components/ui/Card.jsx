import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Card component for @voilajsx/appkit documentation site
 * Used for displaying content in card format with various styling options
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.title] - Card title
 * @param {string} [props.description] - Card description
 * @param {ReactNode} [props.icon] - Icon to display
 * @param {string} [props.to] - Internal link destination
 * @param {string} [props.href] - External link destination
 * @param {boolean} [props.hover=true] - Whether the card should have hover effects
 * @param {boolean} [props.bordered=true] - Whether the card should have a border
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md'] - Card padding
 * @param {'none'|'sm'|'md'|'lg'} [props.shadow='sm'] - Card shadow
 * @param {'none'|'default'|'primary'|'subtle'} [props.variant='default'] - Card style variant
 */
function Card({
  children,
  className = '',
  title,
  description,
  icon,
  to,
  href,
  hover = true,
  bordered = true,
  padding = 'md',
  shadow = 'sm',
  variant = 'default',
  ...rest
}) {
  // Base classes for all cards
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-200';
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7'
  };
  
  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg'
  };
  
  // Border classes
  const borderClasses = bordered ? 'border border-gray-200 dark:border-gray-800' : '';
  
  // Hover classes
  const hoverClasses = hover ? 
    'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700' : '';
  
  // Variant classes for background, text color, etc.
  const variantClasses = {
    none: '',
    default: 'bg-white dark:bg-gray-900',
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50',
    subtle: 'bg-gray-50 dark:bg-gray-800/50'
  };
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses} 
    ${paddingClasses[padding] || paddingClasses.md} 
    ${shadowClasses[shadow] || shadowClasses.sm}
    ${borderClasses}
    ${hoverClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${className}
  `;

  // Card content with consistent structure
  const cardContent = (
    <>
      {(icon || title || description) && (
        <div className={children ? 'mb-4' : ''}>
          {/* Icon */}
          {icon && (
            <div className="mb-3 text-2xl text-voila-blue dark:text-voila-purple">
              {icon}
            </div>
          )}
          
          {/* Title */}
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Card content */}
      {children}
    </>
  );
  
  // Render as link if to or href is provided
  if (to) {
    return (
      <Link to={to} className={cardClasses} {...rest}>
        {cardContent}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a 
        href={href} 
        className={cardClasses} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...rest}
      >
        {cardContent}
      </a>
    );
  }
  
  // Default: render as div
  return (
    <div className={cardClasses} {...rest}>
      {cardContent}
    </div>
  );
}

export default Card;