/**
 * Test setup and utilities for @voilajsx/appkit session module
 * Provides mock objects and test helpers
 *
 * @file src/session/tests/setup.js
 */

import { vi } from 'vitest';

// Test constants
export const TEST_SECRET = 'test-secret-key-for-session-tests';
export const TEST_USER = {
  id: 123,
  username: 'testuser',
  name: 'Test User',
  role: 'user',
};

/**
 * Creates a mock request object for testing
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
export function createMockRequest(options = {}) {
  return {
    headers: options.headers || {},
    cookies: options.cookies || {},
    query: options.query || {},
    body: options.body || {},
    method: options.method || 'GET',
    url: options.url || '/',
    path: options.path || '/',
    ...options,
  };
}

/**
 * Creates a mock response object for testing
 * @param {Object} options - Response options
 * @returns {Object} Mock response object
 */
export function createMockResponse(options = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    headersSent: false,

    writeHead: vi.fn((status, headers = {}) => {
      res.statusCode = status;
      Object.assign(res.headers, headers);
      res.headersSent = true;
      return res;
    }),

    setHeader: vi.fn((name, value) => {
      if (!res.headers[name]) {
        res.headers[name] = [];
      }
      if (Array.isArray(res.headers[name])) {
        res.headers[name].push(value);
      } else {
        res.headers[name] = [res.headers[name], value];
      }
      return res;
    }),

    getHeader: vi.fn((name) => {
      return res.headers[name];
    }),

    end: vi.fn((data) => {
      if (data) {
        try {
          res.body = JSON.parse(data);
        } catch (e) {
          res.body = data;
        }
      }
      res.headersSent = true;
      return res;
    }),

    json: vi.fn((data) => {
      res.headers['Content-Type'] = 'application/json';
      res.body = data;
      res.headersSent = true;
      return res;
    }),

    status: vi.fn((code) => {
      res.statusCode = code;
      return res; // Return res for chaining
    }),

    redirect: vi.fn((url) => {
      res.statusCode = 302;
      res.headers.Location = url;
      res.headersSent = true;
      return res;
    }),

    cookie: vi.fn((name, value, options = {}) => {
      const cookieString = `${name}=${encodeURIComponent(value)}`;
      if (!res.headers['Set-Cookie']) {
        res.headers['Set-Cookie'] = [];
      }
      res.headers['Set-Cookie'].push(cookieString);
      return res;
    }),

    clearCookie: vi.fn((name) => {
      const cookieString = `${name}=; Max-Age=0`;
      if (!res.headers['Set-Cookie']) {
        res.headers['Set-Cookie'] = [];
      }
      res.headers['Set-Cookie'].push(cookieString);
      return res;
    }),

    ...options,
  };

  return res;
}

/**
 * Creates a mock session object for testing
 * @param {Object} data - Initial session data
 * @param {Object} options - Session options
 * @returns {Object} Mock session object
 */
export function createMockSession(data = {}, options = {}) {
  let sessionData = { ...data };
  let sessionId = options.id || 'test-session-id';
  let isActive = options.isActive !== false;

  return {
    id: sessionId,
    data: sessionData,

    save: vi.fn(async (newData = {}) => {
      sessionData = { ...sessionData, ...newData };
      sessionData._createdAt = sessionData._createdAt || Date.now();
      sessionData._updatedAt = Date.now();
      if (!sessionId) {
        sessionId = 'new-session-id';
      }
      isActive = true;
    }),

    destroy: vi.fn(async () => {
      sessionData = {};
      sessionId = null;
      isActive = false;
    }),

    regenerate: vi.fn(async () => {
      const oldId = sessionId;
      sessionId = 'regenerated-session-id';
      sessionData._updatedAt = Date.now();
      return oldId;
    }),

    touch: vi.fn(async () => {
      // Session touched to extend expiry
    }),

    isActive: vi.fn(() => isActive),

    getAge: vi.fn(() => {
      const createdAt = sessionData._createdAt;
      return createdAt ? Date.now() - createdAt : null;
    }),
  };
}

/**
 * Creates a mock store for testing
 * @param {Object} initialData - Initial store data
 * @returns {Object} Mock store object
 */
export function createMockStore(initialData = {}) {
  const store = new Map(Object.entries(initialData));

  return {
    data: store,

    get: vi.fn(async (sessionId) => {
      const session = store.get(sessionId);
      if (!session) return null;

      // Check expiration
      if (session.expiresAt && Date.now() > session.expiresAt) {
        store.delete(sessionId);
        return null;
      }

      return session.data;
    }),

    set: vi.fn(async (sessionId, data, maxAge) => {
      const expiresAt = maxAge ? Date.now() + maxAge : null;
      store.set(sessionId, {
        data,
        expiresAt,
        updatedAt: Date.now(),
      });
    }),

    destroy: vi.fn(async (sessionId) => {
      store.delete(sessionId);
    }),

    touch: vi.fn(async (sessionId, maxAge) => {
      const session = store.get(sessionId);
      if (session && maxAge) {
        session.expiresAt = Date.now() + maxAge;
      }
    }),

    clear: vi.fn(async () => {
      store.clear();
    }),

    length: vi.fn(() => store.size),
  };
}

/**
 * Creates a mock Redis client for testing
 * @returns {Object} Mock Redis client
 */
export function createMockRedisClient() {
  const data = new Map();

  return {
    data,

    get: vi.fn(async (key) => {
      return data.get(key) || null;
    }),

    set: vi.fn(async (key, value) => {
      data.set(key, value);
    }),

    setEx: vi.fn(async (key, ttl, value) => {
      data.set(key, value);
      setTimeout(() => data.delete(key), ttl * 1000);
    }),

    setex: vi.fn(async (key, ttl, value) => {
      data.set(key, value);
      setTimeout(() => data.delete(key), ttl * 1000);
    }),

    del: vi.fn(async (...keys) => {
      let deleted = 0;
      keys.forEach((key) => {
        if (data.delete(key)) deleted++;
      });
      return deleted;
    }),

    expire: vi.fn(async (key, ttl) => {
      if (data.has(key)) {
        setTimeout(() => data.delete(key), ttl * 1000);
        return 1;
      }
      return 0;
    }),

    keys: vi.fn(async (pattern) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(data.keys()).filter((key) => regex.test(key));
    }),

    ping: vi.fn(async () => 'PONG'),

    quit: vi.fn(async () => {
      data.clear();
    }),

    connect: vi.fn(async () => {}),

    disconnect: vi.fn(async () => {
      data.clear();
    }),
  };
}

/**
 * Helper to wait for a specific time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create a session cookie string
 * @param {string} sessionId - Session ID
 * @param {Object} options - Cookie options
 * @returns {string} Cookie string
 */
export function createSessionCookie(sessionId, options = {}) {
  let cookie = `sessionId=${sessionId}`;

  if (options.maxAge) {
    cookie += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
  }
  if (options.path) {
    cookie += `; Path=${options.path}`;
  }
  if (options.secure) {
    cookie += '; Secure';
  }
  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

/**
 * Helper to extract session ID from Set-Cookie header
 * @param {string|string[]} setCookieHeader - Set-Cookie header value(s)
 * @returns {string|null} Session ID or null
 */
export function extractSessionId(setCookieHeader) {
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  for (const cookie of cookies) {
    const match = cookie.match(/sessionId=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Helper to simulate middleware execution
 * @param {Function} middleware - Middleware function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise} Promise that resolves when middleware completes
 */
export function runMiddleware(middleware, req, res) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Helper to simulate a complete request cycle
 * @param {Function[]} middlewares - Array of middleware functions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise} Promise that resolves when all middlewares complete
 */
export async function runMiddlewareChain(middlewares, req, res) {
  for (const middleware of middlewares) {
    await runMiddleware(middleware, req, res);
  }
}
