import isEqual from 'lodash.isequal';

import { createConfig } from './create-config';
import module from './module';
import { removeQueryParams, decorateRecord } from './helpers';

// TODO: Avoid to export undefined globals, redefined somewhere else
export let GlobalVue;
export let VuexStore;
export let config;

const plugin = {};

plugin.install = function(Vue, presets) {
    if (plugin.installed) { return; }
    plugin.installed = true;

    config = createConfig(presets);

    GlobalVue = Vue;
    Vue.$fetchRoute = { connect, decorateRecords, compareRecords, invokeFetch };
};

export default plugin;


/**
 * Wire up a vuex store with the app
 * @access public
 * @param {object} store - A vuex store containing the `router` module
 * @return {function} Unsync function
 */
function connect(store) {
    // console.log(store.state['vue-fetch-route']);

    VuexStore = store;
    VuexStore.registerModule(config.vuexModule, module);

    return () => {
        VuexStore.unregisterModule(config.vuexModule);
    };
}

/**
 * Route config creation helper
 * @access public
 * @param {Array} records - A route record array describing a list of available routes
 * @param {Array} middlewares - A list of middlewares to apply to each route (also recursively)
 * @param {Array} parents - The records' parental hierarchy, the first item being the oldest
 * @return {Array} The enhanced route records, ready for being used by `vue-router`
 */
export function decorateRecords(records = [], middlewares = [], parents = []) {
    middlewares.push(record => decorateRecord(record, parents, middlewares));
    return middlewares.reduce((acc, middleware) => acc.map(record => middleware(record, parents, middlewares)), records);
}

/**
 * Compare two route definitions, ignoring irrelevant information such as hash
 * @access public
 * @param {object} to - A route record describing the previous location
 * @param {object} from - A route record describing the next location
 * @return {boolean} A flag indicating if two records are identical
 */
function compareRecords(to, from) {
    const hasSameName = to.name === from.name;
    const hasSameQuery = isEqual(removeQueryParams(to.query), removeQueryParams(from.query));
    const hasSameParams = isEqual(to.params || {}, from.params || {});

    return hasSameName && hasSameQuery && hasSameParams;
}

/**
 * Start a fetch request
 * @access public
 * @param {object} route - A route descriptor object
 * @param {object} route.params - All currently active params
 * @param {object} route.query - The currently active query object
 * @param {object} route.meta - The route's meta property
 * @return {Promise} A promise returning route data of a page
 */
function invokeFetch({ meta, params, query }) {
    return meta.api.fetch({ params, query });
}
