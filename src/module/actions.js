import { config } from '../index';
import * as types from './mutation-types';

/**
 * Commit available route data into the vuex store
 * @access private
 * @param {Object} context - A vuex action context object
 * @param {Object} payload - A vuex action payload object
 * @param {string} payload.key - The storage address
 * @param {string} payload.value - The storage data to save
 * @return {Promise} A promise that resolves with the route's data
 */
export function setRouteData({ commit }, { key, value }) {
    const { data, partials = {} } = value;

    // Create a promise that acts as singleton data instance
    const FetchPromise = Promise.resolve(data);

    // Implement enclosed partials data, when the route data is written to the store
    Object.keys(partials)
        .map((partialKey) => [partialKey, partials[partialKey]])
        .forEach(([partialKey, partialValue]) => {
            commit(types.SET_PARTIALS_DATA, { key: partialKey, value: partialValue });
        });

    // Commit promise to store
    commit(types.SET_ROUTE_DATA, { key, value: FetchPromise });

    // We directly return the generated FetchPromise for easier data handling in the getter method
    return FetchPromise;
}

/**
 * Retrieve route data from the store, conditionally requesting it from the api endpoint if not available
 * @access private
 * @param {Object} context - A vuex action context object
 * @param {Object} payload - A vuex action payload object
 * @param {string} payload.storageKey - The storage address
 * @param {string} payload.fetchKey - The fetch url
 * @param {string} payload.useCache - A flag to indicate whether to allow fetching from the vuex store
 * @return {Promise} A promise that resolves with the route's data
 */
export function getRouteData({ commit, state, dispatch }, { storageKey, fetchKey, useCache }) {
    let FetchPromise = state.routes[storageKey];
    const loadFromCache = ((useCache || state.isInitialRoute) && FetchPromise);

    config.log(`Using ${ loadFromCache ? 'cached' : 'api' } data`);

    if (state.isInitialRoute) {
        commit(types.SET_IS_INITIAL_ROUTE, { isInitialRoute: false });
    }

    if (loadFromCache) {
        return FetchPromise;
    }

    return new Promise((resolve, reject) => {
        commit(types.SET_LOADING_STATE, { isLoading: true });

        config.fetch(fetchKey).then(
            value => {
                resolve(dispatch('setRouteData', { key: storageKey, value }));
                commit(types.SET_LOADING_STATE, { isLoading: false });
            },
            err => {
                reject(err);
                commit(types.SET_LOADING_STATE, { isLoading: false });
            },
        );
    });
}

/**
 * Remove all routes from the cache
 * @access private
 * @param {Object} context - A vuex action context object
 */
export function flushCache({ commit }) {
    commit(types.FLUSH_CACHE);
}
