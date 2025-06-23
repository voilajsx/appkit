/**
 * Gets smart defaults using VOILA_AUTH_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults(): object;
/**
 * Validates JWT secret strength for production security
 * @param {string} secret - JWT secret to validate
 * @throws {Error} If secret is weak or invalid
 */
export function validateSecret(secret: string): void;
/**
 * Validates bcrypt rounds for security and performance
 * @param {number} rounds - Number of salt rounds
 * @throws {Error} If rounds are outside safe range
 */
export function validateRounds(rounds: number): void;
/**
 * Validates if a role exists in the hierarchy
 * @param {string} role - Role to validate
 * @param {object} roleHierarchy - Role hierarchy to check against
 * @returns {boolean} True if role is valid
 */
export function validateRole(role: string, roleHierarchy: object): boolean;
export namespace DEFAULT_ROLE_HIERARCHY {
    namespace user {
        let level: number;
        let inherits: any[];
    }
    namespace moderator {
        let level_1: number;
        export { level_1 as level };
        let inherits_1: string[];
        export { inherits_1 as inherits };
    }
    namespace admin {
        let level_2: number;
        export { level_2 as level };
        let inherits_2: string[];
        export { inherits_2 as inherits };
    }
    namespace superadmin {
        let level_3: number;
        export { level_3 as level };
        let inherits_3: string[];
        export { inherits_3 as inherits };
    }
}
