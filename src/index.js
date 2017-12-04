import isEqual from 'lodash.isequal';

import { createConfig } from './create-config';
import module from './module';
import { setEndpoint, removeQueryParams } from './helpers';


export let store;
export let config;
const plugin = {};

plugin.install = function(Vue, presets) {
    if (plugin.installed) { return; }
    plugin.installed = true;

    config = createConfig(presets);

    plugin.GlobalVue = Vue;
    Vue.$routeFetch = {
        connect,
        decorateRecords,
        compareRecords,
        invokeFetch,
    };
};

export default plugin;


/**
 * Wire up a vuex store with the app
 * @param {Object} vuexStore - A vuex store containing the `router` module
 * @return {Function} - Unsync function
 */
function connect(vuexStore) {
    const { vuex } = config;
    const name = vuex.namespace ? [vuex.namespace, vuex.module] : vuex.module;

    store = vuexStore;
    store.registerModule(name, module);

    return () => {
        store.unregisterModule(name);
    };
}

/**
 * Route config creation helper
 * @param {Array} records - A route record array describing a list of available routes
 * @param {Array} parents - The records' parental hierarchy, the first item being the oldest
 * @return {Array} - Gives back the enhanced route records, ready for being used by `vue-router`
 */
function decorateRecords(records = [], parents = []) {
    /**
     * Create a route descriptor ready for consumation by `vue-router`
     * @param {Object} record - The base config object received from the server
     * @param {string} record.name - The page's name
     * @param {string} record.path - The base path prior to any manipulation by params or query
     * @param {string} record.component - The component name used by the route
     * @param {Array} record.children - A list of child route definitions
     * @param {string|Array<string>} record.alias - A list of child route definitions
     * @param {string} record.redirect - A list of child route definitions
     * @param {Object} record.meta - An object of properties that shall be available later on in the route
     * @param {Object} record.api - The api definition containing all necessary info to fetch and store this route's data
     * @param {Object} record.api.fetch - The fetch definition used to create the api endpoint
     * @param {Object} record.api.fetched - A data object, containing prefetched data from the server
     */
    return records.map(({ name, path, component, children, alias, redirect, meta = {}, api = {} }) => {
        let { fetch, fetched } = api;
        let result = { name, path, meta, alias, redirect };
        let hierarchy = parents.slice();

        // Add the current route to its own hierarchy
        hierarchy.push(name);

        // Recursively transform child records
        result.children = children && decorateRecords(children, hierarchy);

        if (!redirect && !alias) {
            let page = `page-${ component }`;
            let fetchMethod = setEndpoint(fetch);

            // Invoke the vue component that is used for the route outlet
            result.component = Vue.component(page);

            // Expose all properties that shall be available within the route component as `this.$route.meta`
            Object.assign(result.meta, {
                page, // String reference to the vue component's template
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
    });
}

/**
 * Compare two route definitions, ignoring irrelevant information such as hash
 * @param {Object} to - A route record describing the previous location
 * @param {Object} from - A route record describing the next location
 */
function compareRecords(to, from) {
    const hasSameName = to.name === from.name;
    const hasSameQuery = isEqual(removeQueryParams(to.query), removeQueryParams(from.query));
    const hasSameParams = isEqual(to.params, from.params);

    return hasSameName && hasSameQuery && hasSameParams;
}

/**
 * Start a fetch request
 * @param {Object} route - A route descriptor object
 * @param {Object} route.params - All currently active params
 * @param {Object} route.query - The currently active query object
 */
function invokeFetch({ meta, params, query }) {
    return meta.api.fetch({ params, query });
}
