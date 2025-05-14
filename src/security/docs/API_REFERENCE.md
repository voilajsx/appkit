# Security Module API Reference

## Overview

The `@voilajs/appkit/security` module provides essential security utilities for
Node.js applications, including CSRF protection, rate limiting, and input
sanitization to help prevent common web vulnerabilities.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import {
  generateCsrfToken,
  validateCsrfToken,
  createCsrfMiddleware,
  createRateLimiter,
  sanitizeHtml,
  escapeString,
  sanitizeFilename,
} from '@voilajs/appkit/security';
```

## API Reference

### CSRF Protection

#### generateCsrfToken(session, expiryMinutes)

Generates a CSRF token and stores it in the session.

##### Parameters

| Name            | Type     | Required | Default | Description                          |
| --------------- | -------- | -------- | ------- | ------------------------------------ |
| `session`       | `Object` | Yes      | -       | Session object to store the token in |
| `expiryMinutes` | `number` | No       | `60`    | Minutes until the token expires      |

##### Returns

- `string` - The generated CSRF token

##### Throws

- `Error` - If session is not a valid object

##### Example

```javascript
const token = generateCsrfToken(req.session);
res.render('form', { csrfToken: token });
```

---

#### validateCsrfToken(token, session)

Validates a CSRF token against the stored token in the session.

##### Parameters

| Name      | Type     | Required | Description                        |
| --------- | -------- | -------- | ---------------------------------- |
| `token`   | `string` | Yes      | Token to validate                  |
| `session` | `Object` | Yes      | Session containing the saved token |

##### Returns

- `boolean` - `true` if token is valid, `false` otherwise

##### Example

```javascript
const isValid = validateCsrfToken(req.body._csrf, req.session);
if (isValid) {
  // Process form submission
}
```

---

#### createCsrfMiddleware(options)

Creates middleware for CSRF protection.

##### Parameters

| Name                  | Type     | Required | Default          | Description                           |
| --------------------- | -------- | -------- | ---------------- | ------------------------------------- |
| `options`             | `Object` | No       | `{}`             | Middleware configuration              |
| `options.tokenField`  | `string` | No       | `'_csrf'`        | Form field name containing CSRF token |
| `options.headerField` | `string` | No       | `'x-csrf-token'` | HTTP header field for CSRF token      |

##### Returns

- `Function` - Express middleware function

##### Example

```javascript
const csrf = createCsrfMiddleware();
app.use(csrf);

// Or with custom options
const csrf = createCsrfMiddleware({
  tokenField: 'csrf',
  headerField: 'x-csrf',
});
```

### Rate Limiting

#### createRateLimiter(options)

Creates middleware for rate limiting requests.

##### Parameters

| Name                   | Type       | Required | Default                  | Description                            |
| ---------------------- | ---------- | -------- | ------------------------ | -------------------------------------- |
| `options`              | `Object`   | Yes      | -                        | Rate limiter configuration             |
| `options.windowMs`     | `number`   | Yes      | -                        | Time window in milliseconds            |
| `options.max`          | `number`   | Yes      | -                        | Maximum requests per window            |
| `options.message`      | `string`   | No       | `'Too many requests...'` | Error message when limit exceeded      |
| `options.keyGenerator` | `Function` | No       | IP address function      | Function to generate unique client key |
| `options.store`        | `Object`   | No       | In-memory Map            | Custom store for rate limit data       |

##### Returns

- `Function` - Express middleware function

##### Throws

- `Error` - If required options are missing

##### Example

```javascript
// Basic usage - 100 requests per 15 minutes
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Advanced usage with custom key generator
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'API rate limit exceeded',
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
});
app.use('/api/', apiLimiter);
```

### Input Sanitization

#### escapeString(input)

Escapes special characters in a string to prevent XSS attacks.

##### Parameters

| Name    | Type     | Required | Description      |
| ------- | -------- | -------- | ---------------- |
| `input` | `string` | Yes      | String to escape |

##### Returns

- `string` - Escaped string safe for rendering in HTML

##### Example

```javascript
const userInput = '<script>alert("XSS")</script>';
const safeOutput = escapeString(userInput);
// Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

---

#### sanitizeHtml(input, options)

Sanitizes HTML input by removing dangerous elements and attributes.

##### Parameters

| Name                   | Type       | Required | Default | Description                    |
| ---------------------- | ---------- | -------- | ------- | ------------------------------ |
| `input`                | `string`   | Yes      | -       | HTML string to sanitize        |
| `options`              | `Object`   | No       | `{}`    | Sanitization options           |
| `options.stripAllTags` | `boolean`  | No       | `false` | Remove all HTML tags when true |
| `options.allowedTags`  | `string[]` | No       | -       | Array of tag names to allow    |

##### Returns

- `string` - Sanitized HTML string

##### Example

```javascript
// Basic usage - removes script tags and event handlers
const dirtyHtml = '<div>Normal content<script>alert("bad")</script></div>';
const cleanHtml = sanitizeHtml(dirtyHtml);
// Result: '<div>Normal content</div>'

// Strip all tags
const textOnly = sanitizeHtml(dirtyHtml, { stripAllTags: true });
// Result: 'Normal content'

// Allow only specific tags
const customTags = sanitizeHtml(dirtyHtml, {
  allowedTags: ['div', 'p', 'span'],
});
// Only div, p, and span tags will remain
```

---

#### sanitizeFilename(filename)

Sanitizes a filename to prevent path traversal attacks.

##### Parameters

| Name       | Type     | Required | Description          |
| ---------- | -------- | -------- | -------------------- |
| `filename` | `string` | Yes      | Filename to sanitize |

##### Returns

- `string` - Sanitized filename

##### Example

```javascript
const userFilename = '../../../etc/passwd';
const safeFilename = sanitizeFilename(userFilename);
// Result: 'etcpasswd'

const normalFilename = 'my-document.pdf';
const result = sanitizeFilename(normalFilename);
// Result: 'my-document.pdf'
```

## Error Handling

All functions in this module throw descriptive errors that should be caught and
handled appropriately:

```javascript
try {
  const token = generateCsrfToken(session);
} catch (error) {
  console.error('Token generation failed:', error.message);
}
```

### Common Error Messages

| Function            | Error Message                   | Cause                    |
| ------------------- | ------------------------------- | ------------------------ |
| `generateCsrfToken` | "Session object is required"    | Invalid session          |
| `createRateLimiter` | "windowMs and max are required" | Missing required options |

## Security Considerations

1. **CSRF Protection**: Always use HTTPS in production to protect tokens
2. **Rate Limiting**: For high-traffic production environments, consider using a
   distributed store like Redis
3. **HTML Sanitization**: For highly sensitive applications, consider using a
   dedicated library like DOMPurify
4. **Error Messages**: Never expose internal details in error messages to
   clients
5. **Sessions**: Ensure session management is secure with proper cookie settings

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create type declarations or
use JSDoc type annotations.

```typescript
// Example type declarations
interface CsrfOptions {
  tokenField?: string;
  headerField?: string;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: any) => string;
  store?: Map<string, any>;
}

interface SanitizeHtmlOptions {
  stripAllTags?: boolean;
  allowedTags?: string[];
}
```

## Performance Tips

1. **Rate Limiter**: Use a distributed store for multi-server environments
2. **Sanitization**: For server-rendered applications, sanitize once before
   storage instead of on every render
3. **CSRF Protection**: Generate tokens at login instead of for every form
4. **Regular Expressions**: The sanitization functions use regex; be mindful of
   input size

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
