import React from 'react';

/**
 * ApiTable component for @voilajsx/appkit documentation site
 * Displays structured API reference information in table format
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Table title
 * @param {string} [props.description] - Optional description text
 * @param {Array<Object>} props.data - Array of data objects to display
 * @param {Array<{key: string, header: string, render?: Function}>} props.columns - Column configuration
 * @param {string} [props.type='parameters'] - Table type (parameters, options, methods, properties, etc.)
 * @param {boolean} [props.collapsible=false] - Whether the table is collapsible
 * @param {boolean} [props.defaultOpen=true] - Default open state if collapsible
 * @param {string} [props.className] - Additional CSS classes
 */
function ApiTable({
  title,
  description,
  data,
  columns,
  type = 'parameters',
  collapsible = false,
  defaultOpen = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  // Handle toggle for collapsible tables
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  // Get appropriate header text based on table type
  const getTypeHeader = () => {
    switch (type) {
      case 'parameters':
        return 'Parameters';
      case 'options':
        return 'Options';
      case 'properties':
        return 'Properties';
      case 'methods':
        return 'Methods';
      case 'returns':
        return 'Returns';
      case 'throws':
        return 'Throws';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className={`api-table my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 ${className}`}>
      {/* Table header */}
      <div className={`
        px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
        ${collapsible ? 'cursor-pointer' : ''}
      `} 
      onClick={collapsible ? handleToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title || getTypeHeader()}
          </h3>
          
          {collapsible && (
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={isOpen ? "Collapse section" : "Expand section"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>
      
      {/* Table content */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column) => (
                    <td
                      key={`${index}-${column.key}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                    >
                      {column.render 
                        ? column.render(item[column.key], item)
                        : renderCell(item[column.key], column.key)
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Render a cell based on its key and value
 * Special handling for different column types
 */
function renderCell(value, columnKey) {
  // Handle required/optional status
  if (columnKey === 'required' && typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Required
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        Optional
      </span>
    );
  }
  
  // Handle types with code formatting
  if (columnKey === 'type' || columnKey === 'returns' || columnKey === 'name') {
    return (
      <code className="px-1 py-0.5 text-sm bg-gray-100 dark:bg-gray-900 rounded font-mono">
        {value}
      </code>
    );
  }
  
  // Handle default values
  if (columnKey === 'default' && value === undefined) {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }
  
  // Handle default values that should be code-formatted
  if (columnKey === 'default' && value !== undefined) {
    return (
      <code className="px-1 py-0.5 text-sm bg-gray-100 dark:bg-gray-900 rounded font-mono">
        {typeof value === 'string' ? value : JSON.stringify(value)}
      </code>
    );
  }
  
  // Default rendering
  return value;
}

export default ApiTable;