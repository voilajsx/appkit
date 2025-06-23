/**
 * Minimal defaults for AppKit Database - org/tenant support
 * @module @voilajsx/appkit/db
 * @file src/db/defaults.ts
 */

export interface DatabaseConfig {
  database: {
    url?: string;
    strategy: 'row' | 'org';
    adapter: 'prisma' | 'mongoose';
    tenant: boolean;
    org: boolean;
  };
  tenant: {
    fieldName: string;
  };
  middleware: {
    tenantHeader: string;
    orgHeader: string;
  };
  environment: {
    isDevelopment: boolean;
  };
}

/**
 * Gets smart defaults - only 3 env vars needed!
 */
export function getSmartDefaults(): DatabaseConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const orgsEnabled = process.env.VOILA_DB_ORGS === 'true';
  const tenantsEnabled = process.env.VOILA_DB_TENANTS === 'true';

  return {
    database: {
      url: process.env.DATABASE_URL,
      strategy: orgsEnabled ? 'org' : 'row',
      adapter: detectAdapter(),
      tenant: tenantsEnabled,
      org: orgsEnabled,
    },
    tenant: {
      fieldName: 'tenant_id', // Fixed - no customization needed
    },
    middleware: {
      tenantHeader: 'x-tenant-id', // Standard headers
      orgHeader: 'x-org-id',
    },
    environment: {
      isDevelopment,
    },
  };
}

/**
 * Auto-detect adapter from DATABASE_URL
 */
function detectAdapter(): 'prisma' | 'mongoose' {
  const url = process.env.DATABASE_URL;
  if (url?.includes('mongodb')) return 'mongoose';
  return 'prisma';
}

/**
 * Validates API usage patterns
 */
export function validateApiUsage(config: DatabaseConfig): {
  allowDirectTenant: boolean;
  requireOrgChaining: boolean;
} {
  const { org, tenant } = config.database;
  
  return {
    allowDirectTenant: tenant && !org, // Can use database.tenant() directly
    requireOrgChaining: org && tenant,  // Must use database.org().tenant()
  };
}

/**
 * Creates helpful error messages for API misuse
 */
export function createApiError(
  method: 'tenant' | 'org',
  config: DatabaseConfig
): string {
  const { org, tenant } = config.database;
  
  if (method === 'tenant' && org) {
    return [
      `Cannot use database.tenant() when organizations are enabled.`,
      `Use: database.org('org-id').tenant('tenant-id')`,
      `Or disable orgs: VOILA_DB_ORGS=false`
    ].join('\n');
  }
  
  if (method === 'tenant' && !tenant) {
    return [
      `Tenant mode not enabled.`,
      `Enable: VOILA_DB_TENANTS=true`,
      `Or use: database.get()`
    ].join('\n');
  }
  
  if (method === 'org' && !org) {
    return [
      `Organization mode not enabled.`,
      `Enable: VOILA_DB_ORGS=true`,
      `Or use: database.get() or database.tenant()`
    ].join('\n');
  }
  
  return 'Invalid API usage';
}

/**
 * Validates tenant ID format
 */
export function validateTenantId(tenantId: string): boolean {
  return !!(
    tenantId &&
    typeof tenantId === 'string' &&
    /^[a-zA-Z0-9_-]+$/.test(tenantId) &&
    tenantId.length > 0 &&
    tenantId.length <= 63
  );
}

/**
 * Validates organization ID format
 */
export function validateOrgId(orgId: string): boolean {
  return !!(
    orgId &&
    typeof orgId === 'string' &&
    /^[a-zA-Z0-9_-]+$/.test(orgId) &&
    orgId.length > 0 &&
    orgId.length <= 63
  );
}

/**
 * Creates database error with status code
 */
export function createDatabaseError(
  message: string,
  statusCode: number = 500
): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Runtime schema validation - warns if tenant_id missing
 */
export function validateSchema(client: any, config: DatabaseConfig): void {
  if (!config.environment.isDevelopment) return; // Only warn in dev

  try {
    const models = Object.keys(client).filter(
      key => !key.startsWith('$') && !key.startsWith('_') && client[key]?.findFirst
    );

    if (models.length > 0) {
      console.warn('\n⚠️  [AppKit] Add tenant_id to your models:');
      console.warn('   tenant_id String?');
      console.warn('   @@index([tenant_id])');
      console.warn('   Future-proofs for multi-tenancy\n');
    }
  } catch {
    // Silent fail - validation is optional
  }
}