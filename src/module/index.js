import { GlobalVue } from '../index';

import * as types from './mutation-types';
import * as actions from './actions';

const mutations = Object.freeze({
    [types.SET_IS_INITIAL_ROUTE](state, { isInitialRoute }) {
        state.isInitialRoute = isInitialRoute;
    },
    [types.SET_ROUTE_DATA](state, { key, value }) {
        GlobalVue.set(state.routes, key, value);
    },
    [types.SET_PARTIALS_DATA](state, { key, value }) {
        GlobalVue.set(state.partials, key, value);
    },
    [types.SET_LOADING_STATE](state, { isLoading }) {
        state.isLoading = isLoading;
    },
    [types.FLUSH_CACHE](state) {
        GlobalVue.set(state, 'routes', {});
        GlobalVue.set(state, 'partials', {});
    },
});

const state = {
    isInitialRoute: true,
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
