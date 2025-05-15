# @voilajs/appkit/utils - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work in any JavaScript environment
   - Examples should not rely on any specific framework

## Function Signatures

### Object Utilities

#### pick(obj, keys)

```typescript
function pick(obj: Record<string, any>, keys: string[]): Record<string, any>;
```

- Throws: `'First argument must be an object'` if obj is not an object

#### omit(obj, keys)

```typescript
function omit(obj: Record<string, any>, keys: string[]): Record<string, any>;
```

- Throws: `'First argument must be an object'` if obj is not an object

#### deepMerge(target, ...sources)

```typescript
function deepMerge(
  target: Record<string, any>,
  ...sources: Record<string, any>[]
): Record<string, any>;
```

#### deepClone(obj)

```typescript
function deepClone<T>(obj: T): T;
```

#### get(obj, path, defaultValue)

```typescript
function get(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: any
): any;
```

- Default `defaultValue`: `undefined`

#### set(obj, path, value)

```typescript
function set(
  obj: Record<string, any>,
  path: string | string[],
  value: any
): Record<string, any>;
```

- Returns the modified object

#### has(obj, path)

```typescript
function has(obj: Record<string, any>, path: string | string[]): boolean;
```

#### flatten(obj, separator)

```typescript
function flatten(
  obj: Record<string, any>,
  separator?: string
): Record<string, any>;
```

- Default `separator`: `'.'`

#### unflatten(obj, separator)

```typescript
function unflatten(
  obj: Record<string, any>,
  separator?: string
): Record<string, any>;
```

- Default `separator`: `'.'`

#### isEqual(a, b)

```typescript
function isEqual(a: any, b: any): boolean;
```

#### isEmpty(value)

```typescript
function isEmpty(value: any): boolean;
```

#### defaults(obj, defaultValues)

```typescript
function defaults(
  obj: Record<string, any>,
  defaultValues: Record<string, any>
): Record<string, any>;
```

#### mapKeys(obj, iteratee)

```typescript
function mapKeys(
  obj: Record<string, any>,
  iteratee: (key: string, value: any, obj: Record<string, any>) => string
): Record<string, any>;
```

#### mapValues(obj, iteratee)

```typescript
function mapValues(
  obj: Record<string, any>,
  iteratee: (value: any, key: string, obj: Record<string, any>) => any
): Record<string, any>;
```

#### groupBy(array, key)

```typescript
function groupBy<T>(
  array: T[],
  key: string | ((item: T) => string)
): Record<string, T[]>;
```

#### keyBy(array, key)

```typescript
function keyBy<T>(
  array: T[],
  key: string | ((item: T) => string)
): Record<string, T>;
```

### String Utilities

#### capitalize(str)

```typescript
function capitalize(str: string): string;
```

#### camelCase(str)

```typescript
function camelCase(str: string): string;
```

#### snakeCase(str)

```typescript
function snakeCase(str: string): string;
```

#### kebabCase(str)

```typescript
function kebabCase(str: string): string;
```

#### pascalCase(str)

```typescript
function pascalCase(str: string): string;
```

#### titleCase(str)

```typescript
function titleCase(str: string): string;
```

#### generateId(length, prefix)

```typescript
function generateId(length?: number, prefix?: string): string;
```

- Default `length`: `16`
- Default `prefix`: `''`

#### generateUuid()

```typescript
function generateUuid(): string;
```

#### slugify(str, options)

```typescript
function slugify(
  str: string,
  options?: {
    separator?: string;
    lowercase?: boolean;
    strict?: boolean;
    maxLength?: number;
  }
): string;
```

- Default `options.separator`: `'-'`
- Default `options.lowercase`: `true`
- Default `options.strict`: `false`
- Default `options.maxLength`: `100`

#### truncate(str, length, suffix)

```typescript
function truncate(str: string, length: number, suffix?: string): string;
```

- Default `suffix`: `'...'`

#### padStart(str, length, char)

```typescript
function padStart(str: string, length: number, char?: string): string;
```

- Default `char`: `' '`

#### padEnd(str, length, char)

```typescript
function padEnd(str: string, length: number, char?: string): string;
```

- Default `char`: `' '`

#### template(str, data)

```typescript
function template(str: string, data: Record<string, any>): string;
```

#### escapeHtml(str)

```typescript
function escapeHtml(str: string): string;
```

#### unescapeHtml(str)

```typescript
function unescapeHtml(str: string): string;
```

#### escapeRegExp(str)

```typescript
function escapeRegExp(str: string): string;
```

#### maskString(str, options)

```typescript
function maskString(
  str: string,
  options?: {
    showFirst?: number;
    showLast?: number;
    maskChar?: string;
    minMaskLength?: number;
  }
): string;
```

- Default `options.showFirst`: `0`
- Default `options.showLast`: `0`
- Default `options.maskChar`: `'*'`
- Default `options.minMaskLength`: `3`

### Date Utilities

#### formatDate(date, format)

```typescript
function formatDate(date: Date | string | number, format: string): string;
```

#### parseDate(dateString, format)

```typescript
function parseDate(dateString: string, format?: string): Date;
```

#### addDays(date, days)

```typescript
function addDays(date: Date | string | number, days: number): Date;
```

#### addMonths(date, months)

```typescript
function addMonths(date: Date | string | number, months: number): Date;
```

#### addYears(date, years)

```typescript
function addYears(date: Date | string | number, years: number): Date;
```

#### subDays(date, days)

```typescript
function subDays(date: Date | string | number, days: number): Date;
```

#### subMonths(date, months)

```typescript
function subMonths(date: Date | string | number, months: number): Date;
```

#### subYears(date, years)

```typescript
function subYears(date: Date | string | number, years: number): Date;
```

#### dateDiff(date1, date2, unit)

```typescript
function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): number;
```

- Default `unit`: `'days'`
- Throws: `'Invalid unit'` if unit is not supported

#### startOf(date, unit)

```typescript
function startOf(
  date: Date | string | number,
  unit: 'day' | 'month' | 'year'
): Date;
```

- Throws: `'Invalid unit'` if unit is not supported

#### endOf(date, unit)

```typescript
function endOf(
  date: Date | string | number,
  unit: 'day' | 'month' | 'year'
): Date;
```

- Throws: `'Invalid unit'` if unit is not supported

#### isBetween(date, start, end)

```typescript
function isBetween(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean;
```

#### isAfter(date1, date2)

```typescript
function isAfter(
  date1: Date | string | number,
  date2: Date | string | number
): boolean;
```

#### isBefore(date1, date2)

```typescript
function isBefore(
  date1: Date | string | number,
  date2: Date | string | number
): boolean;
```

### Async Utilities

#### sleep(ms)

```typescript
function sleep(ms: number): Promise<void>;
```

- Throws: `'Delay must be a positive number'` if ms is not a positive number

#### retry(fn, options)

```typescript
function retry<T>(
  fn: () => Promise<T>,
  options?: {
    attempts?: number;
    delay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (error: Error, attempt: number, delay: number) => void;
    retryIf?: (error: Error) => boolean;
  }
): Promise<T>;
```

- Default `options.attempts`: `3`
- Default `options.delay`: `1000`
- Default `options.maxDelay`: `10000`
- Default `options.factor`: `2`
- Default `options.retryIf`: `() => true`
- Throws: `'First argument must be a function'`, `'Attempts must be at least 1'`

#### timeout(promise, ms, timeoutError)

```typescript
function timeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError?: string | Error
): Promise<T>;
```

- Default `timeoutError`: `'Operation timed out'`
- Throws: `'First argument must be a Promise'`,
  `'Timeout must be a positive number'`

#### parallel(tasks, concurrency)

```typescript
function parallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency?: number
): Promise<T[]>;
```

- Default `concurrency`: `Infinity`
- Throws: `'Tasks must be an array'`, `'Concurrency must be a positive number'`

#### series(tasks)

```typescript
function series<T>(tasks: Array<() => Promise<T>>): Promise<T[]>;
```

- Throws: `'Tasks must be an array'`

#### debounce(fn, wait, options)

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): T & { cancel: () => void };
```

- Default `options.leading`: `false`
- Default `options.trailing`: `true`
- Throws: `'First argument must be a function'`,
  `'Wait must be a positive number'`

#### throttle(fn, wait, options)

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): T & { cancel: () => void };
```

- Default `options.leading`: `true`
- Default `options.trailing`: `true`
- Throws: `'First argument must be a function'`,
  `'Wait must be a positive number'`

#### mapAsync(array, mapper, concurrency)

```typescript
function mapAsync<T, R>(
  array: T[],
  mapper: (item: T, index: number, array: T[]) => Promise<R>,
  concurrency?: number
): Promise<R[]>;
```

- Default `concurrency`: `Infinity`
- Throws: `'First argument must be an array'`, `'Mapper must be a function'`

#### filterAsync(array, predicate, concurrency)

```typescript
function filterAsync<T>(
  array: T[],
  predicate: (item: T, index: number, array: T[]) => Promise<boolean>,
  concurrency?: number
): Promise<T[]>;
```

- Default `concurrency`: `Infinity`
- Throws: `'First argument must be an array'`, `'Predicate must be a function'`

#### allSettled(promises)

```typescript
function allSettled<T>(promises: Array<Promise<T>>): Promise<
  Array<{
    status: 'fulfilled' | 'rejected';
    value?: T;
    reason?: any;
  }>
>;
```

- Throws: `'First argument must be an array of promises'`

#### raceWithTimeout(promises, ms, timeoutError)

```typescript
function raceWithTimeout<T>(
  promises: Array<Promise<T>>,
  ms: number,
  timeoutError?: string | Error
): Promise<T>;
```

- Default `timeoutError`: `'Race timed out'`
- Throws: `'First argument must be an array of promises'`

#### deferred()

```typescript
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};
```

#### createQueue(concurrency)

```typescript
function createQueue(concurrency?: number): {
  push: <T>(task: () => Promise<T>) => Promise<T>;
  wait: () => Promise<void>;
  size: () => number;
  clear: () => void;
};
```

- Default `concurrency`: `1`
- Throws: `'Concurrency must be a positive number'`

## Example Implementations

### Object Utility Example

```javascript
/**
 * Merges user data with defaults
 * @param {Object} userData - User-provided data
 * @returns {Object} Complete user data with defaults
 */
function createUser(userData) {
  const defaultData = {
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: true,
    },
    createdAt: new Date().toISOString(),
  };

  // Merge defaults with user data
  const user = deepMerge({}, defaultData, userData);

  // Extract only the fields we need
  return pick(user, [
    'id',
    'name',
    'email',
    'role',
    'preferences',
    'createdAt',
  ]);
}

/**
 * Gets user settings with defaults
 * @param {Object} user - User object
 * @returns {Object} User settings
 */
function getUserSettings(user) {
  // Extract user preferences
  const preferences = get(user, 'preferences', {});

  // Apply defaults
  return defaults(preferences, {
    theme: 'light',
    notifications: true,
    language: 'en',
  });
}
```

### String Utility Example

```javascript
/**
 * Generates a secure URL slug
 * @param {string} title - Content title
 * @param {string} id - Content ID
 * @returns {string} SEO-friendly URL slug
 */
function generateSlug(title, id) {
  const baseSlug = slugify(title, {
    lowercase: true,
    strict: true,
    maxLength: 80,
  });

  // Append ID for uniqueness
  return `${baseSlug}-${id.substring(0, 8)}`;
}

/**
 * Creates a display name from user data
 * @param {Object} user - User object
 * @returns {string} Formatted display name
 */
function formatDisplayName(user) {
  if (!user) return '';

  // Use full name if available
  if (user.firstName && user.lastName) {
    return `${titleCase(user.firstName)} ${titleCase(user.lastName)}`;
  }

  // Fall back to username
  if (user.username) {
    return user.username;
  }

  // Mask email as last resort
  if (user.email) {
    return maskString(user.email, {
      showFirst: 3,
      showLast: 4,
      maskChar: '*',
    });
  }

  return 'Anonymous User';
}
```

### Date Utility Example

```javascript
/**
 * Formats date for display
 * @param {Date|string} date - Date to format
 * @param {string} type - Format type (short, medium, full)
 * @returns {string} Formatted date
 */
function formatDisplayDate(date, type = 'medium') {
  if (!date) return '';

  switch (type) {
    case 'short':
      return formatDate(date, 'MM/DD/YYYY');
    case 'medium':
      return formatDate(date, 'MMM DD, YYYY');
    case 'full':
      return formatDate(date, 'MMMM DD, YYYY HH:mm');
    default:
      return formatDate(date, 'YYYY-MM-DD');
  }
}

/**
 * Calculates subscription period
 * @param {Object} subscription - Subscription data
 * @returns {Object} Period info
 */
function getSubscriptionPeriod(subscription) {
  const startDate = new Date(subscription.startDate);
  const endDate = subscription.endDate
    ? new Date(subscription.endDate)
    : addMonths(startDate, subscription.duration || 1);

  // Calculate remaining days
  const totalDays = dateDiff(startDate, endDate, 'days');
  const remainingDays = dateDiff(new Date(), endDate, 'days');

  // Calculate percentage
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - remainingDays) / totalDays) * 100)
  );

  return {
    startDate,
    endDate,
    totalDays,
    remainingDays,
    progress: Math.round(progress),
    isActive: remainingDays > 0,
  };
}
```

### Async Utility Example

```javascript
/**
 * Fetches data with retry and timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function fetchWithRetry(url, options = {}) {
  return retry(
    async () => {
      // Add timeout to the fetch
      const response = await timeout(
        fetch(url, options),
        5000,
        new Error(`Fetch timeout for ${url}`)
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return response.json();
    },
    {
      attempts: 3,
      delay: 1000,
      factor: 2,
      onRetry: (error, attempt) => {
        console.warn(`Retry attempt ${attempt} for ${url}: ${error.message}`);
      },
      retryIf: (error) => {
        // Only retry server errors or network issues
        return (
          error.message.includes('HTTP error 5') ||
          error.message.includes('network')
        );
      },
    }
  );
}

/**
 * Processes items with limited concurrency
 * @param {Array} items - Items to process
 * @param {Function} processor - Item processor function
 * @returns {Promise<Array>} Processed results
 */
async function processItems(items, processor) {
  // Create a queue with concurrency limit
  const queue = createQueue(5);
  const results = [];

  // Process each item through the queue
  for (const item of items) {
    results.push(
      queue.push(async () => {
        // Add some delay between operations
        await sleep(100);
        return processor(item);
      })
    );
  }

  // Wait for all results
  return Promise.all(results);
}

/**
 * Creates a debounced search function
 * @param {Function} searchFn - Search implementation
 * @returns {Function} Debounced search function
 */
function createDebouncedSearch(searchFn) {
  return debounce(async (query) => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      return await searchFn(query);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, 300);
}
```

## Code Generation Rules

1. **Always use ES modules** for imports and exports
2. **Include parameter validation** at the beginning of functions
3. **Return empty/default values** for edge cases (empty strings, null objects)
4. **Use async/await** for all asynchronous code
5. **Include error handling** for all functions that could throw or reject
6. **Follow JSDoc format** exactly as shown
7. **Prefer pure functions** without side effects when possible
8. **Use named exports** rather than default exports

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
