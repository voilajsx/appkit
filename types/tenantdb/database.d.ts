/**
 * Creates a multi-tenant database instance
 * @param {Object} config - Configuration options
 * @param {string} config.url - Database connection URL
 * @param {string} [config.strategy] - Tenancy strategy: 'row' or 'database' (auto-detected)
 * @param {string} [config.adapter] - Database adapter: 'prisma' or 'mongoose' (auto-detected)
 * @returns {Object} Multi-tenant database instance
 */
export function createDb(config: {
    url: string;
    strategy?: string;
    adapter?: string;
}): any;
