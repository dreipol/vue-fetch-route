import { GlobalVue } from '../index';

import * as types from './mutation-types';
import * as actions from './actions';

const mutations = {
    [types.SET_ROUTE_DATA](state, { key, value }) {
        GlobalVue.set(state.routes, key, value);
    },
    [types.SET_PARTIALS_DATA](state, { key, value }) {
        GlobalVue.set(state.partials, key, value);
    },
    [types.SET_LOADING_STATE](state, { isLoading }) {
        state.isLoading = isLoading;
    },
};

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
