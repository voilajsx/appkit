/**
 * Smart defaults and environment validation for email with auto-strategy detection
 * @module @voilajsx/appkit/email
 * @file src/email/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to configure email strategy and connection settings
 * @llm-rule AVOID: Calling multiple times - expensive environment parsing, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 * @llm-rule NOTE: Auto-detects Resend → SMTP → Console based on environment variables
 */
export interface ResendConfig {
    apiKey: string;
    baseURL: string;
    timeout: number;
}
export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    timeout: number;
    pool: boolean;
}
export interface ConsoleConfig {
    colorize: boolean;
    showPreview: boolean;
    format: 'simple' | 'detailed';
}
export interface EmailConfig {
    strategy: 'resend' | 'smtp' | 'console';
    from: {
        name: string;
        email: string;
    };
    resend?: ResendConfig;
    smtp?: SmtpConfig;
    console?: ConsoleConfig;
    environment: {
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
        nodeEnv: string;
    };
}
/**
 * Gets smart defaults using environment variables with auto-strategy detection
 * @llm-rule WHEN: App startup to get production-ready email configuration
 * @llm-rule AVOID: Calling repeatedly - expensive validation, cache the result
 * @llm-rule NOTE: Auto-detects strategy: RESEND_API_KEY → Resend, SMTP_HOST → SMTP, default → Console
 */
export declare function getSmartDefaults(): EmailConfig;
/**
 * Gets email configuration summary for debugging and health checks
 * @llm-rule WHEN: Debugging email configuration or building health check endpoints
 * @llm-rule AVOID: Exposing sensitive API keys or passwords - this only shows safe info
 */
export declare function getConfigSummary(): {
    strategy: string;
    fromName: string;
    fromEmail: string;
    resendConfigured: boolean;
    smtpConfigured: boolean;
    environment: string;
};
/**
 * Validates that required email configuration is present for production
 * @llm-rule WHEN: App startup validation for production deployments
 * @llm-rule AVOID: Skipping validation - missing email config causes runtime issues
 */
export declare function validateProductionRequirements(): void;
//# sourceMappingURL=defaults.d.ts.map