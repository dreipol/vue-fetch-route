import plugin from '../index';

import * as types from './mutation-types';
import * as actions from './actions';

/**
 * The mutations available in the module
 */
const mutations = {
    [types.SET_ROUTE_DATA](state, { key, value }) {
        plugin.GlobalVue.set(state.routes, key, value);
    },
    [types.SET_PARTIALS_DATA](state, { key, value }) {
        plugin.GlobalVue.set(state.partials, key, value);
    },
    [types.SET_LOADING_STATE](state, { isLoading }) {
        state.isLoading = isLoading;
    },
};

/**
 * The state of the module
 */
const state = {
    isLoading: false,
    routes: {},
    partials: {},
};


export default {
    namespaced: true,
    mutations,
    actions,
    state,
};
