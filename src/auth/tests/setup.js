/**
 * Test setup and utilities for auth module tests
 * @module @voilajs/appkit/auth/tests
 */

export const TEST_SECRET = 'test-secret-key-for-testing';
export const TEST_PASSWORD = 'TestPassword123!';
export const TEST_PAYLOAD = {
  userId: '123',
  email: 'test@example.com',
  roles: ['user'],
};

// Mock request object for middleware tests
export function createMockRequest(options = {}) {
  return {
    headers: options.headers || {},
    cookies: options.cookies || {},
    query: options.query || {},
    body: options.body || {},
    user: null,
  };
}

// Mock response object for middleware tests
export function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = data;
      this.headers['Content-Type'] = 'application/json';
      return this;
    },
    send: function (data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

// Mock next function for middleware tests
export function createMockNext() {
  const next = jest.fn();
  return next;
}
