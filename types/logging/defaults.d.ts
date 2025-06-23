/**
 * Clean, unified logging configuration with auto scope detection
 * @module @voilajsx/appkit/logging
 * @file src/logging/defaults.js
 *
 * Environment Variables Reference:
 * VOILA_LOGGING_SCOPE=auto|minimal|full     # auto (default), minimal, full
 * VOILA_LOGGING_CONSOLE=true|false          # true (default), false
 * VOILA_LOGGING_FILE=true|false             # true (default), false
 * VOILA_LOGGING_DATABASE=true|false         # false (default), true - EXPLICIT opt-in only
 * VOILA_LOGGING_HTTP_URL=https://...        # URL auto-enables HTTP transport
 * VOILA_LOGGING_WEBHOOK_URL=https://...     # URL auto-enables webhook transport
 *
 * Optional:
 * VOILA_LOGGING_LEVEL=debug|info|warn|error # Auto-detected by environment
 * VOILA_LOGGING_DIR=./logs                  # Log directory path
 * VOILA_SERVICE_NAME=my-service             # Service name in logs
 */
/**
 * Gets smart defaults using simplified VOILA_LOGGING_* environment variables
 * @returns {object} Configuration object with smart defaults and transport config
 */
export function getSmartDefaults(): object;
