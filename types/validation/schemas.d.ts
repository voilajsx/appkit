/**
 * Creates a new schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
export function createValidationSchema(definition: any): any;
export namespace commonSchemas {
    namespace email {
        export let type: string;
        export let required: boolean;
        let email_1: boolean;
        export { email_1 as email };
        export let trim: boolean;
        export let maxLength: number;
    }
    namespace password {
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export let minLength: number;
        let maxLength_1: number;
        export { maxLength_1 as maxLength };
        export function validate(value: any): true | "Password must contain at least one uppercase letter" | "Password must contain at least one lowercase letter" | "Password must contain at least one number" | "Password must contain at least one special character";
    }
    namespace username {
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        let minLength_1: number;
        export { minLength_1 as minLength };
        let maxLength_2: number;
        export { maxLength_2 as maxLength };
        let trim_1: boolean;
        export { trim_1 as trim };
        export let alphanumeric: boolean;
    }
    namespace url {
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        let url_1: boolean;
        export { url_1 as url };
        let trim_2: boolean;
        export { trim_2 as trim };
        let maxLength_3: number;
        export { maxLength_3 as maxLength };
    }
    namespace boolean {
        let type_4: string;
        export { type_4 as type };
    }
    namespace integer {
        let type_5: string;
        export { type_5 as type };
        let integer_1: boolean;
        export { integer_1 as integer };
    }
}
