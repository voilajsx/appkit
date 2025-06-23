/**
 * Session Store Interface
 * All stores must implement these methods:
 * - async get(sessionId): Promise<Object|null>
 * - async set(sessionId, data, maxAge): Promise<void>
 * - async destroy(sessionId): Promise<void>
 * - async touch(sessionId, maxAge): Promise<void>
 */
/**
 * In-memory session store (default)
 * Best for: Development, testing, single-process applications
 */
export class MemoryStore {
    sessions: Map<any, any>;
    timers: Map<any, any>;
    /**
     * Gets a session by ID
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object|null>} Session data or null if not found/expired
     */
    get(sessionId: string): Promise<any | null>;
    /**
     * Sets session data
     * @param {string} sessionId - Session identifier
     * @param {Object} sessionData - Data to store
     * @param {number} [maxAge] - Session max age in milliseconds
     * @returns {Promise<void>}
     */
    set(sessionId: string, sessionData: any, maxAge?: number): Promise<void>;
    /**
     * Destroys a session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<void>}
     */
    destroy(sessionId: string): Promise<void>;
    /**
     * Extends session expiration
     * @param {string} sessionId - Session identifier
     * @param {number} maxAge - New max age in milliseconds
     * @returns {Promise<void>}
     */
    touch(sessionId: string, maxAge: number): Promise<void>;
    /**
     * Gets session count (useful for monitoring)
     * @returns {number} Number of active sessions
     */
    length(): number;
    /**
     * Clears all sessions
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
}
/**
 * File-based session store
 * Best for: Simple production deployments, single-server applications
 */
export class FileStore {
    constructor(directory?: string, options?: {});
    directory: string;
    extension: any;
    cleanupInterval: any;
    encoding: any;
    initialized: boolean;
    cleanupTimer: any;
    /**
     * Initialize store
     * @private
     */
    private init;
    /**
     * Ensures session directory exists
     * @private
     */
    private ensureDirectory;
    /**
     * Gets file path for session
     * @private
     */
    private getFilePath;
    /**
     * Gets a session by ID
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object|null>} Session data or null if not found/expired
     */
    get(sessionId: string): Promise<any | null>;
    /**
     * Sets session data
     * @param {string} sessionId - Session identifier
     * @param {Object} sessionData - Data to store
     * @param {number} [maxAge] - Session max age in milliseconds
     * @returns {Promise<void>}
     */
    set(sessionId: string, sessionData: any, maxAge?: number): Promise<void>;
    /**
     * Destroys a session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<void>}
     */
    destroy(sessionId: string): Promise<void>;
    /**
     * Cleanup resources when store is no longer needed
     */
    destroy(): void;
    /**
     * Extends session expiration
     * @param {string} sessionId - Session identifier
     * @param {number} maxAge - New max age in milliseconds
     * @returns {Promise<void>}
     */
    touch(sessionId: string, maxAge: number): Promise<void>;
    /**
     * Starts background cleanup of expired sessions
     * @private
     */
    private startCleanup;
    /**
     * Stops cleanup timer
     */
    stopCleanup(): void;
    /**
     * Clears all sessions
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
}
/**
 * Redis session store
 * Best for: Production applications, multi-server deployments
 */
export class RedisStore {
    constructor(client: any, options?: {});
    client: any;
    prefix: any;
    serializer: any;
    clientType: string;
    /**
     * Detect Redis client type for better compatibility
     * @private
     */
    private detectClientType;
    /**
     * Gets Redis key for session
     * @private
     */
    private getKey;
    /**
     * Gets a session by ID
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object|null>} Session data or null if not found/expired
     */
    get(sessionId: string): Promise<any | null>;
    /**
     * Sets session data
     * @param {string} sessionId - Session identifier
     * @param {Object} sessionData - Data to store
     * @param {number} [maxAge] - Session max age in milliseconds
     * @returns {Promise<void>}
     */
    set(sessionId: string, sessionData: any, maxAge?: number): Promise<void>;
    /**
     * Destroys a session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<void>}
     */
    destroy(sessionId: string): Promise<void>;
    /**
     * Extends session expiration
     * @param {string} sessionId - Session identifier
     * @param {number} maxAge - New max age in milliseconds
     * @returns {Promise<void>}
     */
    touch(sessionId: string, maxAge: number): Promise<void>;
    /**
     * Gets session count (useful for monitoring)
     * @returns {Promise<number>} Number of active sessions
     */
    length(): Promise<number>;
    /**
     * Clears all sessions
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
    /**
     * Test Redis connection
     * @returns {Promise<boolean>} True if connected
     */
    ping(): Promise<boolean>;
}
declare namespace _default {
    export { MemoryStore };
    export { FileStore };
    export { RedisStore };
}
export default _default;
