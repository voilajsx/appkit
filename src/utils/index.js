/**
 * @voilajs/appkit - Utils module
 * @module @voilajs/appkit/utils
 */

// Object utilities
export {
  pick,
  omit,
  deepMerge,
  deepClone,
  get,
  set,
  has,
  flatten,
  unflatten,
  isEqual,
  isEmpty,
  defaults,
  mapKeys,
  mapValues,
  groupBy,
  keyBy,
} from './object.js';

// String utilities
export {
  capitalize,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  titleCase,
  generateId,
  generateUuid,
  slugify,
  truncate,
  padStart,
  padEnd,
  template,
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  maskString,
} from './string.js';

// Date utilities
export {
  formatDate,
  parseDate,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysBetween,
  getMonthsBetween,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  formatDuration,
  formatRelative,
} from './date.js';

// Async utilities
export {
  sleep,
  retry,
  timeout,
  debounce,
  throttle,
  queue,
  parallel,
  series,
  race,
  waterfall,
  memoize,
  once,
  poll,
} from './async.js';
