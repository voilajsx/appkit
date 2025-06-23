export namespace prismadb {
    /**
     * Configure global database URL
     * @param {string} url - Database URL
     */
    function configure(url: string): void;
    /**
     * Get client for app (with auto-detection)
     * @param {string} appName - App name (optional if can be auto-detected)
     * @param {Object} config - Optional config with url
     * @returns {Object} Prisma client
     */
    function get(appName?: string, config?: any): any;
    /**
     * List available apps
     * @returns {Array} App names
     */
    function list(): any[];
    /**
     * Get current app name based on execution path
     * @returns {string|null} Current app name
     */
    function currentApp(): string | null;
    function health(appName: any): Promise<{
        app: any;
        status: string;
        error?: undefined;
    } | {
        app: any;
        status: string;
        error: any;
    }>;
}
export default prismadb;
