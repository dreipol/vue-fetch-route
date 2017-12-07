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
    Object.entries(partials).forEach(([partialKey, partialValue]) => {
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
    const hasCache = (useCache && FetchPromise);

    config.log(`Using ${ hasCache ? 'cached' : 'api' } data`);

    if (hasCache) {
        return FetchPromise;
    }

    return new Promise((resolve, reject) => {
        commit(types.SET_LOADING_STATE, { isLoading: true });

        config.fetch(fetchKey).then(
            request => {
                resolve(dispatch('setRouteData', { key: storageKey, value: request.data }));
                commit(types.SET_LOADING_STATE, { isLoading: false });
            },
            err => {
                reject(err);
                commit(types.SET_LOADING_STATE, { isLoading: false });
            },
        );
    });
}
