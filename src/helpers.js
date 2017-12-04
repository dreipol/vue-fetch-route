import cloneDeep from 'lodash.clonedeep';
import { config, store } from './index';


/**
 * Access namespaced module in vuex store
 */
function namespaced() {
    return `${ config.vuex.namespace }${ config.vuex.module }`;
}


/**
 * Compile full fetch api endpoint by using params and query objects
 * @param {string} fetchUrl - A base string, used as a template
 * @param {Object} params - A params object that fills the params gap in the `fetchUrl` template string
 * @param {Object} query - A query object that is being appended to the `fetchUrl` template string
 * @return {string} - The fully compiled fetch url
 */
export function compileFetchUrl(fetchUrl, params, query) {
    // Leverage params object to compile fetch url
    fetchUrl = Object.entries(params).reduce((url, [key, val]) => {
        return url.replace(`:${ key }`, val);
    }, fetchUrl);

    // Leverage query object to compile fetch url
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, val]) => searchParams.append(key, val));
    const search = searchParams.toString();

    return `${ fetchUrl }${ search.length ? '?' : '' }${ search }`;
}

/**
 * Register an api url and create a function through which api data can be accessed (via cache or api call)
 * @param {Object} fetch - A fetch endpoint definition
 * @param {string} fetch.url - The basic url prior to any manipulation
 * @param {Object} fetch.params - A list of base params that are being merged with specific params, later on
 * @param {Object} fetch.query - A query object that is being merged with the specific query object, later on
 * @return {Function} - Return a handler function for accessing fetch data via a returned promise
 */
export function setEndpoint({ cache = true, url, params: presetParams, query: presetQuery }) {
    return function fetch({ params: routeParams, query: routeQuery, response }) {
        // Merge params and query with route presets
        const params = Object.assign({}, presetParams, routeParams);
        const query = Object.assign({}, presetQuery, routeQuery);

        // Create compiled endpoint url
        const { fetchKey, storageKey } = createUrlKeys(compileFetchUrl, url, params, query);

        // Push available data into the store's endpoint address
        if (response) {
            config.log.debug(`Saving prefetched data for URL '${ storageKey }'`);
            return store.dispatch(`${ namespaced() }/setRouteData`, { key: storageKey, value: response });
        }

        // Fetch data from compiled endpoint
        config.log.debug(`Fetching data for URL '${ fetchKey }'... Caching is ${ cache ? 'enabled' : 'disabled' }.`);
        return store.dispatch(`${ namespaced() }/getRouteData`, { storageKey, fetchKey, cache });
    };
}

/**
 * Create endpoint urls for fetching and storing
 */
export function createUrlKeys(compileFn, fetchUrl, params, query) {
    return {
        fetchKey: compileFn(fetchUrl, params, filterQueryParams(query)),
        storageKey: compileFn(fetchUrl, params, removeQueryParams(query)),
    };
}

/**
 * Filter query params for djangoCMS static placeholders
 */
function filterQueryParams(query = {}) {
    const result = Object.assign({ partials: [] }, cloneDeep(query));
    const partials = store.state[namespaced()].partials;

    result.partials = result.partials.filter(name => !partials[name]);

    if (result.partials.length === 0) {
        delete result.partials;
    }

    return result;
}

/**
 * Remove query params for djangoCMS static placeholders
 */
export function removeQueryParams(query = {}) {
    const result = cloneDeep(query);

    config.ignoredQueryParams.forEach(val => {
        delete result[val];
    });

    return result;
}
