export const presets = {
    /**
     * Log method to gain some insights about route navigation and data storing
     * @type {Function}
     * @default
     */
    log: window.console.log,
    /**
     * Method used to invoke when fetching data
     * @type {Function}
     * @default
     */
    fetch: window.fetch,
    /**
     * A list of query params that are ignored when defining the key to store the data.<br>
     * This is important to avoid storing data copies of the same route under different keys.
     * @type {Array<string>}
     * @default
     */
    ignoredQueryParams: ['partials'],
    /**
     * The name that is used to register the vuex module to the store
     * @type {string}
     * @default
     */
    vuexModule: 'vue-fetch-route',
};
