import * as types from './mutation-types';
import * as actions from './actions';

const mutations = (Vue) => Object.freeze({
    [types.SET_ROUTE_DATA](state, { key, value }) {
        Vue.set(state.routes, key, value);
    },
    [types.SET_PARTIALS_DATA](state, { key, value }) {
        Vue.set(state.partials, key, value);
    },
    [types.SET_LOADING_STATE](state, { isLoading }) {
        state.isLoading = isLoading;
    },
    [types.FLUSH_CACHE](state) {
        Vue.set(state, 'routes', {});
        Vue.set(state, 'partials', {});
    },
});

const state = Object.seal({
    isLoading: false,
    routes: {},
    partials: {},
});


export default (Vue) => {
    return {
        namespaced: true,
        mutations: mutations(Vue),
        actions,
        state,
    };
};

