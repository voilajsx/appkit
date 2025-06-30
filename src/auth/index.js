/**
 * Ultra-simple role-level-permission authentication that just works
 * @module @voilajsx/appkit/auth
 * @file src/auth/index.js
 */

import { AuthenticationClass } from './authentication.js';
import { getSmartDefaults } from './defaults.js';

// Global authentication instance for performance
let globalAuthentication = null;

/**
 * Get authentication instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {AuthenticationClass} Authentication instance with all methods
 */
function get(overrides = {}) {
  // Lazy initialization - parse environment once
  if (!globalAuthentication) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...overrides };
    globalAuthentication = new AuthenticationClass(config);
  }

  return globalAuthentication;
}

/**
 * Reset global instance (useful for testing or config changes)
 * @param {object} [newConfig] - Optional new configuration
 * @returns {AuthenticationClass} Fresh authentication instance
 */
function reset(newConfig = {}) {
  const defaults = getSmartDefaults();
  const config = { ...defaults, ...newConfig };
  globalAuthentication = new AuthenticationClass(config);
  return globalAuthentication;
}

/**
 * Get current role hierarchy for inspection
 * @returns {object} Current role hierarchy configuration
 */
function getRoles() {
  const auth = get();
  return auth.config.roles;
}

/**
 * Get current permission configuration for inspection
 * @returns {object} Current permission configuration
 */
function getPermissions() {
  const auth = get();
  return auth.config.permissions;
}

/**
 * Check if a role.level exists in current configuration
 * @param {string} roleLevel - Role.level to check (e.g., 'admin.tenant')
 * @returns {boolean} True if role.level exists
 */
function isValidRole(roleLevel) {
  const auth = get();
  return auth.config.roles[roleLevel] !== undefined;
}

/**
 * Get all available role.levels in hierarchy order
 * @returns {string[]} Array of role.levels sorted by hierarchy level
 */
function getAllRoles() {
  const auth = get();
  const roles = auth.config.roles;

  return Object.keys(roles).sort((a, b) => roles[a].level - roles[b].level);
}

/**
 * Single authentication export with minimal functionality
 */
export const authenticator = {
  // Core method
  get,

  // Utility methods
  reset,
  getRoles,
  getPermissions,
  isValidRole,
  getAllRoles,
};
