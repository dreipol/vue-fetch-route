import isEqual from 'lodash.isequal';

import { createConfig } from './create-config';
import module from './module';
import { setEndpoint, removeQueryParams } from './helpers';

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
 * @param {Object} store - A vuex store containing the `router` module
 * @return {Function} Unsync function
 */
function connect(store) {
    VuexStore = store;
    VuexStore.registerModule(config.vuexModule, module);

    return () => {
        VuexStore.unregisterModule(name);
    };
}

/**
 * Route config creation helper
 * @access public
 * @param {Array} records - A route record array describing a list of available routes
 * @param {Array} parents - The records' parental hierarchy, the first item being the oldest
 * @return {Array} The enhanced route records, ready for being used by `vue-router`
 */
function decorateRecords(records = [], parents = []) {
    return records.map(record => decorateRecord(Object.assign({}, record, { parents })));
}

/**
 * Create a route descriptor ready for consumation by `vue-router`
 * @access private
 * @param {Object} record - The base config object received from the server
 * @param {string} record.path - The base path prior to any manipulation by params or query
 * @param {string} record.component - The component name used by the route
 * @param {string} record.name - The page's name
 * @param {Array} record.children - A list of child route definitions
 * @param {string|Array<string>} record.alias - A list of child route definitions
 * @param {string} record.redirect - A list of child route definitions
 * @param {Array} record.parents - The records' parental hierarchy, the first item being the oldest
 * @param {Object} record.meta - An object of properties that shall be available later on in the route
 * @param {Object} record.api - The api definition containing all necessary info to fetch and store this route's data
 * @param {Object} record.api.fetch - The fetch definition used to create the api endpoint
 * @param {Object} record.api.fetched - A data object, containing prefetched data from the server
 * @return {Object} A newly created route record
 */
function decorateRecord({ path, component, name, children, alias, redirect, parents, meta = {}, api = {} }) {
    let { fetch, fetched } = api;
    let result = { path, component, name, alias, redirect, meta };
    let hierarchy = parents.slice();

    // Add the current route to its own hierarchy
    hierarchy.push(name);

    // Recursively transform child records
    result.children = children && decorateRecords(children, hierarchy);

    if (!redirect && !alias) {
        let fetchMethod = setEndpoint(fetch);

        // Expose all properties that shall be available within the route component as `this.$route.meta`
        Object.assign(result.meta, {
            hierarchy, // String tuple of this route's parents including itself as the last index
            api: Object.assign({ fetch: fetchMethod }, fetch),
        });

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
 * Compare two route definitions, ignoring irrelevant information such as hash
 * @access public
 * @param {Object} to - A route record describing the previous location
 * @param {Object} from - A route record describing the next location
 * @return {boolean} A flag indicating if two records are identical
 */
function compareRecords(to, from) {
    const hasSameName = to.name === from.name;
    const hasSameQuery = isEqual(removeQueryParams(to.query), removeQueryParams(from.query));
    const hasSameParams = isEqual(to.params, from.params);

    return hasSameName && hasSameQuery && hasSameParams;
}

/**
 * Start a fetch request
 * @access public
 * @param {Object} route - A route descriptor object
 * @param {Object} route.params - All currently active params
 * @param {Object} route.query - The currently active query object
 * @param {Object} route.meta - The route's meta property
 * @return {Promise} A promise returning route data of a page
 */
function invokeFetch({ meta, params, query }) {
    return meta.api.fetch({ params, query });
}
