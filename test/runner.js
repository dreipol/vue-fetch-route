require('jsdom-global')();

const Vue = require('vue');
const Vuex = require('vuex');
const VueFetchRoute = require('../dist');
const noop = () => {};

Vue.use(Vuex);
Vue.use(VueFetchRoute.default, { log: noop, warn: noop });

global.assert = require('assert');
global.Vue = require('vue');
global.store = new Vuex.Store({});
global.routes = Object.freeze([
    { path: '/test' },
    { path: '/app', api: { fetch: { url: '/api/app' } } },
]);

window.URLSearchParams = require('url-search-params');
window.fetch = () => Promise.resolve({ json: () => ({ data: {} }) });

Vue.config.devtools = false;
Vue.config.productionTip = false;

Vue.$fetchRoute.connect(global.store);

describe('vue-fetch-route', () => {
    require('./decorate-records.spec');
    require('./connect.spec');
    require('./compare-records.spec');
    require('./invoke-fetch.spec');

    afterEach(() => {
        global.store.dispatch('vue-fetch-route/flushCache');
    });
});
