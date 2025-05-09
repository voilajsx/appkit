/**
 * @module utils/date
 * @description Date manipulation utilities for @voilajs/appkit
 */

/**
 * Formats a date to string according to the specified format
 * @param {Date} date - Date to format
 * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 * @throws {Error} If date is invalid or format is not provided
 */
export function formatDate(date, format) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (!format || typeof format !== 'string') {
    throw new Error('Format string is required');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // Map of format tokens to their values
  const tokens = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
    SSS: milliseconds,
    // Add short versions
    M: String(date.getMonth() + 1),
    D: String(date.getDate()),
    H: String(date.getHours()),
    m: String(date.getMinutes()),
    s: String(date.getSeconds()),
  };

  let formatted = format;

  // Replace tokens in order of longest to shortest to avoid conflicts
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

  for (const token of sortedTokens) {
    formatted = formatted.replace(new RegExp(token, 'g'), tokens[token]);
  }

  return formatted;
}

/**
 * Parses a date string to Date object according to the specified format
 * @param {string} dateString - Date string to parse
 * @param {string} format - Format string describing the date string format
 * @returns {Date} Parsed date object
 * @throws {Error} If dateString or format is invalid
 */
export function parseDate(dateString, format) {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date string is required');
  }

  if (!format || typeof format !== 'string') {
    throw new Error('Format string is required');
  }

  // Create regex pattern from format string
  let pattern = format;
  const tokenMap = new Map();

  // Replace format tokens with capturing groups
  const tokens = {
    YYYY: '(\\d{4})',
    MM: '(\\d{2})',
    DD: '(\\d{2})',
    HH: '(\\d{2})',
    mm: '(\\d{2})',
    ss: '(\\d{2})',
    SSS: '(\\d{3})',
    M: '(\\d{1,2})',
    D: '(\\d{1,2})',
    H: '(\\d{1,2})',
    m: '(\\d{1,2})',
    s: '(\\d{1,2})',
  };

  // Track positions of each token type
  let position = 0;
  const tokenPositions = [];

  // Sort tokens by length (longest first) to handle overlapping patterns
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

  for (const token of sortedTokens) {
    let index = pattern.indexOf(token);
    while (index !== -1) {
      tokenPositions.push({ token, index });
      pattern =
        pattern.substring(0, index) +
        tokens[token] +
        pattern.substring(index + token.length);
      index = pattern.indexOf(token, index + tokens[token].length);
    }
  }

  // Sort by position to maintain order
  tokenPositions.sort((a, b) => a.index - b.index);

  // Create regex from pattern
  const regex = new RegExp(`^${pattern}$`);
  const match = dateString.match(regex);

  if (!match) {
    throw new Error(
      `Date string "${dateString}" does not match format "${format}"`
    );
  }

  // Extract values
  const values = {
    year: 1970,
    month: 0,
    day: 1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };

  // Map captured groups to date components
  tokenPositions.forEach((tokenPos, index) => {
    const value = parseInt(match[index + 1], 10);

    switch (tokenPos.token) {
      case 'YYYY':
        values.year = value;
        break;
      case 'MM':
      case 'M':
        values.month = value - 1; // JavaScript months are 0-indexed
        break;
      case 'DD':
      case 'D':
        values.day = value;
        break;
      case 'HH':
      case 'H':
        values.hours = value;
        break;
      case 'mm':
      case 'm':
        values.minutes = value;
        break;
      case 'ss':
      case 's':
        values.seconds = value;
        break;
      case 'SSS':
        values.milliseconds = value;
        break;
    }
  });

  // Create date
  const date = new Date(
    values.year,
    values.month,
    values.day,
    values.hours,
    values.minutes,
    values.seconds,
    values.milliseconds
  );

  // Validate the date
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date values parsed from "${dateString}"`);
  }

  return date;
}

/**
 * Adds days to a date
 * @param {Date} date - Date to add days to
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date with days added
 * @throws {Error} If date is invalid or days is not a number
 */
export function addDays(date, days) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (typeof days !== 'number' || isNaN(days)) {
    throw new Error('Days must be a valid number');
  }

  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds months to a date
 * @param {Date} date - Date to add months to
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date with months added
 */
export function addMonths(date, months) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (typeof months !== 'number' || isNaN(months)) {
    throw new Error('Months must be a valid number');
  }

  const result = new Date(date);
  const currentMonth = result.getMonth();
  const currentYear = result.getFullYear();

  // Calculate new month and year
  const newMonth = currentMonth + months;
  const yearDiff = Math.floor(newMonth / 12);
  const finalMonth = ((newMonth % 12) + 12) % 12;

  result.setFullYear(currentYear + yearDiff);
  result.setMonth(finalMonth);

  // Handle edge case where day doesn't exist in new month
  // (e.g., Jan 31 + 1 month = Feb 31, which doesn't exist)
  if (result.getMonth() !== finalMonth) {
    // Set to last day of previous month
    result.setDate(0);
  }

  return result;
}

/**
 * Adds years to a date
 * @param {Date} date - Date to add years to
 * @param {number} years - Number of years to add (can be negative)
 * @returns {Date} New date with years added
 */
export function addYears(date, years) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (typeof years !== 'number' || isNaN(years)) {
    throw new Error('Years must be a valid number');
  }

  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Checks if a date is valid
 * @param {Date} date - Date to check
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Gets the difference between two dates in specified unit
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - Unit to measure difference ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
 * @returns {number} Difference between dates
 */
export function dateDiff(date1, date2, unit = 'days') {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    throw new Error('Invalid dates provided');
  }

  const diff = date1.getTime() - date2.getTime();

  switch (unit) {
    case 'days':
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    case 'hours':
      return Math.floor(diff / (1000 * 60 * 60));
    case 'minutes':
      return Math.floor(diff / (1000 * 60));
    case 'seconds':
      return Math.floor(diff / 1000);
    case 'milliseconds':
      return diff;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
}

/**
 * Checks if a date is between two other dates (inclusive)
 * @param {Date} date - Date to check
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {boolean} True if date is between start and end
 */
export function isBetween(date, start, end) {
  if (!isValidDate(date) || !isValidDate(start) || !isValidDate(end)) {
    throw new Error('Invalid dates provided');
  }

  return date >= start && date <= end;
}

/**
 * Gets the start of a time period (day, month, year)
 * @param {Date} date - Date to get start of period for
 * @param {string} period - Period type ('day', 'month', 'year')
 * @returns {Date} Start of period
 */
export function startOf(date, period) {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided');
  }

  const result = new Date(date);

  switch (period) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return result;
}

/**
 * Gets the end of a time period (day, month, year)
 * @param {Date} date - Date to get end of period for
 * @param {string} period - Period type ('day', 'month', 'year')
 * @returns {Date} End of period
 */
export function endOf(date, period) {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided');
  }

  const result = new Date(date);

  switch (period) {
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1);
      result.setDate(0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setMonth(11);
      result.setDate(31);
      result.setHours(23, 59, 59, 999);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return result;
}

/**
 * Formats date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export function toISOString(date) {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided');
  }

  return date.toISOString();
}
