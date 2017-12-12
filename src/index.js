import isEqual from 'lodash.isequal';

import { createConfig } from './create-config';
import module from './module';
import { decorateRecord, namespaced, removeQueryParams } from './helpers';

const PLUGIN = Object.freeze({
    Vue: null,
    config: null,
    VuexStore: null,
    connect,
    decorateRecords,
    decorateRecord,
    compareRecords,
    invokeFetch,
});

/**
 * Plugin installation script
 */
export default (function install() {
    let isInstalled = false;

    return (Vue, presets) => {
        return (function() {
            if (isInstalled) { return; }
            isInstalled = true;

            Vue.$fetchRoute = {
                ...Object.create(PLUGIN),
                Vue,
                config: createConfig(presets),
            };
        });
    };
}());

/**
 * Wire up a vuex store with the app
 * @access public
 * @this PLUGIN
 * @param {Object} store - A vuex store containing the `router` module
 * @return {Function} Unsync function
 */
function connect(store) {
    const { config } = this;
    const VuexStore = this.VuexStore = store;

    VuexStore.registerModule(config.vuexModule, module);

    return () => {
        VuexStore.unregisterModule(namespaced(this.config));
    };
}

/**
 * Route config creation helper
 * @access public
 * @this PLUGIN
 * @param {Array} records - A route record array describing a list of available routes
 * @param {Array} parents - The records' parental hierarchy, the first item being the oldest
 * @return {Array} The enhanced route records, ready for being used by `vue-router`
 */
function decorateRecords(records = [], parents = []) {
    return records.map(record => this.decorateRecord(record, parents));
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
    const hasSameParams = isEqual(to.params || {}, from.params || {});

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
