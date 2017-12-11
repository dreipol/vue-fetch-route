import cloneDeep from 'lodash.clonedeep';
import { config, VuexStore, decorateRecords } from './index';


/**
 * Access namespaced module in vuex store
 * @access private
 * @return {string} The namespaced module name
 */
export function namespaced() {
    const { vuexModule } = config;
    return Array.isArray(vuexModule) ? vuexModule.join('/') : vuexModule;
}

/**
 * Create a route descriptor ready for consumation by `vue-router`
 * @access private
 * @param {Object} record - The base config object received from the server
 * @param {Array} parents - The records' parental hierarchy, the first item being the oldest
 * @return {Object} A newly created route record
 */
export function decorateRecord({ api = {}, ...record }, parents) {
    let result = cloneDeep(record);
    let { path, children, alias, redirect } = result;
    let { fetch, fetched } = api;

    // Add the current route to its own hierarchy
    let hierarchy = parents.slice();
    hierarchy.push(path);

    // Recursively transform child records
    if (children) {
        result.children = decorateRecords(children, hierarchy);
    }

    if (!fetch) {
        return record;
    }

    if (!redirect && !alias) {
        // Expose all properties that shall be available within the route component as `this.$route.meta`
        result.meta = {
            ...(result.meta || {}),
            hierarchy, // String tuple of this route's parents including itself as the last index
            api: {
                fetch: setEndpoint(fetch),
                ...fetch,
            },
        };

        // Fetched data may already be present when initializing, store it in that case
        if (fetched) {
            result.meta.api.fetch(fetched);
        }
    }

    // Remove undefined object entries
    Object.keys(result).forEach(key => result[key] === undefined && delete result[key]); // eslint-disable-line no-undefined

    return result;
}

/**
 * Compile full fetch api endpoint by using params and query objects
 * @access private
 * @param {string} fetchUrl - A base string, used as a template
 * @param {Object} params - A params object that fills the params gap in the `fetchUrl` template string
 * @param {Object} query - A query object that is being appended to the `fetchUrl` template string
 * @return {string} - The fully compiled fetch url
 */
export function compileFetchUrl(fetchUrl, params, query) {
    // Leverage params object to compile fetch url
    fetchUrl = Object.keys(params)
        .map((key, _, arr) => [key, arr[key]])
        .reduce((url, [key, val]) => url.replace(`:${ key }`, val), fetchUrl);

    // Leverage query object to compile fetch url
    const searchParams = new window.URLSearchParams();
    Object.keys(query)
        .map((key, _, arr) => [key, arr[key]])
        .forEach(([key, val]) => searchParams.append(key, val));
    const search = searchParams.toString();

    return `${ fetchUrl }${ search.length ? '?' : '' }${ search }`;
}

/**
 * Register an api url and create a function through which api data can be accessed (via cache or api call)
 * @access private
 * @param {Object} fetch - A fetch endpoint definition
 * @param {string} fetch.useCache - A flag to indicate whether to allow vuex store caching
 * @param {string} fetch.url - The basic url prior to any manipulation
 * @param {Object} fetch.params - A list of base params that are being merged with specific params, later on
 * @param {Object} fetch.query - A query object that is being merged with the specific query object, later on
 * @return {Function} - Return a handler function for accessing fetch data via a returned promise
 */
function setEndpoint({ useCache = true, url, params: presetParams, query: presetQuery }) {
    return function fetch({ params: routeParams, query: routeQuery, response } = {}) {
        // Merge params and query with route presets
        const params = Object.assign({}, presetParams, routeParams);
        const query = Object.assign({}, presetQuery, routeQuery);

        // Create compiled endpoint url
        const { fetchKey, storageKey } = createUrlKeys(compileFetchUrl, url, params, query);

        // Push available data into the store's endpoint address
        if (response) {
            config.log(`Saving prefetched data for URL '${ storageKey }'`);
            return VuexStore.dispatch(`${ namespaced() }/setRouteData`, { key: storageKey, value: response });
        }

        // Fetch data from compiled endpoint
        config.log(`Fetching data for URL '${ fetchKey }'... Caching is ${ useCache ? 'enabled' : 'disabled' }.`);
        return VuexStore.dispatch(`${ namespaced() }/getRouteData`, { storageKey, fetchKey, useCache });
    };
}

/**
 * Create endpoint urls for fetching and storing
 * @access private
 * @param {Function} compileFn - The method to compile a fetch/storage url out of a raw url
 * @param {string} fetchUrl - The raw url
 * @param {Object} params - The params object
 * @param {Object} query - The query object
 * @return {Object} An object containing the fetch and the storage url
 */
export function createUrlKeys(compileFn, fetchUrl, params, query) {
    return {
        fetchKey: compileFn(fetchUrl, params, filterQueryParams(query)),
        storageKey: compileFn(fetchUrl, params, removeQueryParams(query)),
    };
}

/**
 * Filter query params for djangoCMS static placeholders
 * @access private
 * @param {Object} query - The input query object
 * @param {Vuex.Store} store - The vuex store object
 * @return {Object} The filtered query object
 */
function filterQueryParams(query = {}) {
    const result = Object.assign({ partials: [] }, cloneDeep(query));
    const partials = VuexStore.state[namespaced()].partials;

    result.partials = result.partials.filter(name => !partials[name]);

    if (result.partials.length === 0) {
        delete result.partials;
    }

    return result;
}

/**
 * Remove query params for djangoCMS static placeholders
 * @access private
 * @param {Object} query - The query object
 * @return {Object} The stripped query object
 */
export function removeQueryParams(query = {}) {
    const result = cloneDeep(query);

    config.ignoredQueryParams.forEach(val => {
        delete result[val];
    });

    return result;
}
