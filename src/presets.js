export const presets = Object.freeze({
    /**
     * Log method to gain some insights about route navigation and data storing
     * @default
     * @type {function}
     */
    log: window.console.log,
    /**
     * Warn method to notify about possible errors
     * @default
     * @type {function}
     */
    warn: window.console.warn,
    /**
     * Method used to invoke when fetching data
     * @default
     * @type {function}
     * @param {string} url - A fetch url
     * @return {Promise} A promise resolving with the route data
     */
    fetch(url) {
        return new Promise((resolve, reject) => {
            window.fetch(url).then(
                response => resolve(response.json()),
                error => reject(error)
            );
        });
    },
    /**
     * A list of query params that are ignored when defining the key to store the data.<br>
     * This is important to avoid storing data copies of the same route under different keys.
     * @default
     * @type {Array<string>}
     */
    ignoredQueryParams: ['partials'],
    /**
     * The name that is used to register the vuex module to the store
     * @default
     * @type {string}
     */
    vuexModule: 'vue-fetch-route',
});
