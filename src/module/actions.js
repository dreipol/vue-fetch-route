import { config } from '../index';
import * as types from './mutation-types';


/**
 * Commit available route data into the vuex store
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
 */
export function getRouteData({ commit, state, dispatch }, { storageKey, fetchKey, cache }) {
    let FetchPromise = state.routes[storageKey];
    const hasCache = (cache && FetchPromise);

    config.log.debug(`Using ${ hasCache ? 'cached' : 'api' } data`);

    if (hasCache) {
        return FetchPromise;
    }

    return new Promise((resolve, reject) => {
        commit(types.SET_LOADING_STATE, { isLoading: true });

        config.request(fetchKey).then(
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
