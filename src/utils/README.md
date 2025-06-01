# @voilajsx/appkit/utils - Utility Module 🛠️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A collection of robust, framework-agnostic JavaScript utilities for modern web
> development

The Utils module of `@voilajsx/appkit` provides a comprehensive set of utilities
for handling objects, strings, dates, and asynchronous operations. Designed for
simplicity and performance, these functions are perfect for building scalable
Node.js and browser-based applications.

## Module Overview

The Utils module offers a wide range of utilities organized into four
categories:

| Category             | What it does                              | Main functions                               |
| -------------------- | ----------------------------------------- | -------------------------------------------- |
| **Object Utilities** | Manipulate and transform objects          | `pick()`, `deepMerge()`, `groupBy()`         |
| **String Utilities** | Format and generate strings               | `camelCase()`, `slugify()`, `generateUuid()` |
| **Date Utilities**   | Handle date operations and formatting     | `formatDate()`, `addDays()`, `dateDiff()`    |
| **Async Utilities**  | Manage asynchronous tasks and concurrency | `retry()`, `debounce()`, `createQueue()`     |

## 🚀 Features

- **🧩 Object Manipulation** - Merge, clone, pick, and transform objects with
  ease
- **📝 String Formatting** - Convert cases, generate IDs, and create slugs
- **📅 Date Handling** - Format, manipulate, and compare dates
- **⏳ Async Operations** - Control async flows with retries, debouncing, and
  queues
- **🌐 Framework Agnostic** - Works in Node.js, browsers, and any JavaScript
  environment
- **⚡ Lightweight API** - Simple, intuitive functions with minimal dependencies

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import the utilities you need and start using them immediately. Each function is
independent, allowing you to cherry-pick only what your application requires.

```javascript
import { deepMerge, slugify, formatDate, retry } from '@voilajsx/appkit/utils';

// Merge objects
const merged = deepMerge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }

// Create a URL slug
const slug = slugify('Hello World!'); // hello-world

// Format a date
const formatted = formatDate(new Date(), 'YYYY-MM-DD'); // 2025-06-01

// Retry an async operation
const result = await retry(() => fetch('https://api.example.com'), {
  attempts: 3,
});
```

## 📖 Core Functions

### Object Utilities

These utilities help you manipulate and transform objects efficiently, from
picking specific keys to deep merging and grouping data.

| Function      | Purpose                                      | When to use                     |
| ------------- | -------------------------------------------- | ------------------------------- |
| `pick()`      | Extract specific keys from an object         | Filter object properties        |
| `omit()`      | Remove specific keys from an object          | Exclude unwanted properties     |
| `deepMerge()` | Deeply merge multiple objects                | Combine configuration objects   |
| `deepClone()` | Create a deep copy of an object              | Avoid mutating original objects |
| `get()`       | Get value at a path with default fallback    | Safe nested property access     |
| `set()`       | Set value at a path                          | Update nested properties        |
| `has()`       | Check if a path exists in an object          | Validate object structure       |
| `flatten()`   | Flatten nested object to single level        | Simplify nested data            |
| `unflatten()` | Convert flat object to nested structure      | Restore nested data             |
| `isEqual()`   | Compare two values for deep equality         | Check object equivalence        |
| `isEmpty()`   | Check if a value is empty                    | Validate inputs                 |
| `defaults()`  | Apply default values to an object            | Set fallback values             |
| `mapKeys()`   | Transform object keys                        | Rename object properties        |
| `mapValues()` | Transform object values                      | Modify object values            |
| `groupBy()`   | Group array items by a key                   | Organize data for reports or UI |
| `keyBy()`     | Create object with items keyed by a property | Index data by unique property   |

```javascript
// Pick specific keys
const obj = pick({ name: 'John', age: 30, email: 'john@example.com' }, [
  'name',
  'email',
]);
// { name: 'John', email: 'john@example.com' }

// Deep merge objects
const result = deepMerge({ user: { name: 'John' } }, { user: { age: 30 } });
// { user: { name: 'John', age: 30 } }
```

### String Utilities

These functions enable case conversion, ID generation, and text formatting for
URLs, display names, and more.

| Function         | Purpose                                           | When to use                       |
| ---------------- | ------------------------------------------------- | --------------------------------- |
| `capitalize()`   | Capitalize first letter of a string               | Format display text               |
| `camelCase()`    | Convert string to camelCase                       | Format API keys or variable names |
| `snakeCase()`    | Convert string to snake_case                      | Format database fields            |
| `kebabCase()`    | Convert string to kebab-case                      | Format URL paths                  |
| `pascalCase()`   | Convert string to PascalCase                      | Format class names                |
| `titleCase()`    | Convert string to Title Case                      | Format headings                   |
| `generateId()`   | Generate random ID with optional prefix           | Create temporary identifiers      |
| `generateUuid()` | Generate a unique UUID                            | Create unique identifiers         |
| `slugify()`      | Create URL-friendly slugs                         | Generate SEO-friendly URLs        |
| `truncate()`     | Shorten string with suffix                        | Limit text length in UI           |
| `padStart()`     | Pad string start with characters                  | Format fixed-length strings       |
| `padEnd()`       | Pad string end with characters                    | Format fixed-length strings       |
| `template()`     | Replace placeholders in a string                  | Dynamic string generation         |
| `escapeHtml()`   | Escape HTML characters                            | Prevent XSS in user input         |
| `unescapeHtml()` | Unescape HTML characters                          | Process escaped HTML              |
| `escapeRegExp()` | Escape special regex characters                   | Safe regex pattern creation       |
| `maskString()`   | Mask string characters (e.g., for sensitive data) | Protect sensitive information     |

```javascript
// Convert to camelCase
const key = camelCase('hello world'); // helloWorld

// Create a slug
const slug = slugify('My Blog Post!', { separator: '-' }); // my-blog-post

// Generate a UUID
const id = generateUuid(); // e.g., '123e4567-e89b-12d3-a456-426614174000'
```

### Date Utilities

These utilities simplify date manipulation, formatting, and comparison tasks for
user interfaces and data processing.

| Function       | Purpose                                     | When to use                  |
| -------------- | ------------------------------------------- | ---------------------------- |
| `formatDate()` | Format a date to a specific pattern         | Display dates in UI          |
| `parseDate()`  | Parse a date string to a Date object        | Process user-entered dates   |
| `addDays()`    | Add days to a date                          | Calculate future dates       |
| `addMonths()`  | Add months to a date                        | Subscription renewals        |
| `addYears()`   | Add years to a date                         | Long-term planning           |
| `subDays()`    | Subtract days from a date                   | Calculate past dates         |
| `subMonths()`  | Subtract months from a date                 | Historical data analysis     |
| `subYears()`   | Subtract years from a date                  | Age calculations             |
| `dateDiff()`   | Calculate difference between dates          | Track subscription durations |
| `startOf()`    | Get start of a time unit (day, month, year) | Group data by time period    |
| `endOf()`      | Get end of a time unit (day, month, year)   | Set deadlines                |
| `isBetween()`  | Check if date is between two dates          | Validate date ranges         |
| `isAfter()`    | Check if one date is after another          | Schedule validation          |
| `isBefore()`   | Check if one date is before another         | Event sequencing             |

```javascript
// Format a date
const formatted = formatDate(new Date(), 'MMM DD, YYYY'); // Jun 01, 2025

// Add days
const future = addDays(new Date(), 7); // Date 7 days from now

// Calculate date difference
const days = dateDiff('2025-06-01', '2025-06-08', 'days'); // 7
```

### Async Utilities

These functions manage asynchronous operations, from retrying failed requests to
debouncing user input and controlling concurrency.

| Function            | Purpose                                 | When to use                            |
| ------------------- | --------------------------------------- | -------------------------------------- |
| `sleep()`           | Pause execution for a specified time    | Delay operations                       |
| `retry()`           | Retry a failed async operation          | Handle unreliable network requests     |
| `timeout()`         | Add timeout to a promise                | Prevent hanging operations             |
| `parallel()`        | Run async tasks in parallel             | Optimize multiple API calls            |
| `series()`          | Run async tasks sequentially            | Maintain task order                    |
| `debounce()`        | Limit function call frequency           | Optimize search or input handling      |
| `throttle()`        | Limit function call rate                | Control event frequency                |
| `mapAsync()`        | Map array items to async results        | Process items concurrently             |
| `filterAsync()`     | Filter array items with async predicate | Async data filtering                   |
| `allSettled()`      | Resolve all promises with status        | Handle multiple promises               |
| `raceWithTimeout()` | Race promises with a timeout            | Fastest response with fallback         |
| `deferred()`        | Create a deferred promise               | Manual promise control                 |
| `createQueue()`     | Manage concurrent async tasks           | Process tasks with limited concurrency |

```javascript
// Retry a fetch operation
const data = await retry(() => fetch('https://api.example.com'), {
  attempts: 3,
});

// Debounce a search function
const search = debounce((query) => console.log(query), 300);
search('test'); // Only logs after 300ms of inactivity

// Create a queue
const queue = createQueue(2);
queue.push(async () => processItem(item));
```

## 🔧 Configuration Options

Many utilities offer customization options to fit your needs. Here are some
examples:

### String Utility Options (e.g., `slugify`)

| Option      | Description          | Default | Example      |
| ----------- | -------------------- | ------- | ------------ |
| `separator` | Slug separator       | `'-'`   | `'_'`, `'-'` |
| `lowercase` | Convert to lowercase | `true`  | `false`      |
| `maxLength` | Maximum slug length  | `100`   | `50`         |

```javascript
slugify('Hello World!', { separator: '_', maxLength: 20 });
```

### Async Utility Options (e.g., `retry`)

| Option     | Description                | Default | Example |
| ---------- | -------------------------- | ------- | ------- |
| `attempts` | Number of retry attempts   | `3`     | `5`     |
| `delay`    | Initial retry delay (ms)   | `1000`  | `500`   |
| `factor`   | Exponential backoff factor | `2`     | `1.5`   |

```javascript
retry(fetchData, { attempts: 5, delay: 500, factor: 1.5 });
```

## 💡 Common Use Cases

| Category               | Use Case              | Description                                | Components Used               |
| ---------------------- | --------------------- | ------------------------------------------ | ----------------------------- |
| **Data Processing**    | Config Management     | Merge default and user configurations      | `deepMerge()`, `defaults()`   |
|                        | Data Filtering        | Extract specific fields from API responses | `pick()`, `omit()`            |
|                        | Data Grouping         | Organize items for reports or UI display   | `groupBy()`, `keyBy()`        |
| **Content Formatting** | URL Generation        | Create SEO-friendly URLs                   | `slugify()`, `generateId()`   |
|                        | Display Names         | Format user names for UI                   | `titleCase()`, `maskString()` |
|                        | Text Truncation       | Shorten text for previews                  | `truncate()`, `padStart()`    |
| **Date Handling**      | Event Scheduling      | Manage event dates and deadlines           | `addDays()`, `isBetween()`    |
|                        | Subscription Tracking | Calculate subscription periods             | `dateDiff()`, `formatDate()`  |
|                        | Historical Analysis   | Process past dates for analytics           | `subMonths()`, `startOf()`    |
| **Async Operations**   | API Rate Limiting     | Control API request frequency              | `throttle()`, `debounce()`    |
|                        | Batch Processing      | Process large datasets concurrently        | `mapAsync()`, `createQueue()` |
|                        | Reliable Fetching     | Handle flaky network requests              | `retry()`, `timeout()`        |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common utility scenarios using the `@voilajsx/appkit/utils` module. Refer to
the
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/utils/docs/PROMPT_REFERENCE.md)
document, designed specifically for LLMs to understand the module's capabilities
and generate high-quality utility code.

### How to Use LLM Code Generation

Copy one of the prompts below and share it with an LLM. The LLM will use the
reference document to generate secure, best-practice code tailored to your
requirements.

### Sample Prompts to Try

#### Data Processing Pipeline

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/utils/docs/PROMPT_REFERENCE.md and create a data processing pipeline using @voilajsx/appkit/utils with:
- Deep merging of configuration objects
- Filtering and grouping API response data
- Formatting output for display
```

#### Content Management System

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/utils/docs/PROMPT_REFERENCE.md and implement a CMS utility layer using @voilajsx/appkit/utils that includes:
- Slug generation for articles
- Date formatting for publication schedules
- Async processing of content uploads
```

#### Async Task Manager

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/utils/docs/PROMPT_REFERENCE.md and build an async task manager using @voilajsx/appkit/utils with:
- Concurrent task processing with queues
- Retries for failed tasks
- Debouncing for user input handling
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Object Basics](https://github.com/voilajsx/appkit/blob/main/src/utils/examples/01-object-basics.js) -
  Merging and filtering objects
- [String Formatting](https://github.com/voilajsx/appkit/blob/main/src/utils/examples/02-string-formatting.js) -
  Case conversion and slug generation
- [Date Handling](https://github.com/voilajsx/appkit/blob/main/src/utils/examples/03-date-handling.js) -
  Date manipulation and formatting
- [Async Operations](https://github.com/voilajsx/appkit/blob/main/src/utils/examples/04-async-operations.js) -
  Retries, debouncing, and queues

## 🛡️ Best Practices

1. **Input Validation**: Always validate inputs using `isEmpty()` or custom
   checks
2. **Error Handling**: Use try/catch with async functions like `retry()`
3. **Immutability**: Prefer `deepClone()` to avoid mutating original data
4. **Performance**: Use appropriate concurrency limits in `createQueue()` and
   `mapAsync()`
5. **Security**: Escape user input with `escapeHtml()` and `escapeRegExp()`

## 📊 Performance Considerations

- **Deep Operations**: `deepMerge()` and `deepClone()` can be heavy for large
  objects; use sparingly
- **Async Concurrency**: Set reasonable `concurrency` limits in `parallel()` and
  `createQueue()`
- **Debouncing/Throttling**: Tune `wait` times in `debounce()` and `throttle()`
  for optimal UX
- **Date Parsing**: Cache results of `parseDate()` for frequently used strings

## 🔍 Error Handling

Handle errors appropriately to ensure robust applications:

```javascript
try {
  const result = await retry(fetchData, { attempts: 3 });
} catch (error) {
  if (error.message.includes('Attempts must be at least 1')) {
    // Handle invalid attempts
  } else {
    // Handle other errors
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/utils/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/utils/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/utils/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
