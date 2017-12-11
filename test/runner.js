require('jsdom-global')();

const Vue = require('vue');
const Vuex = require('vuex');
const VueFetchRoute = require('../dist');
const noop = () => {};

Vue.use(Vuex);
Vue.use(VueFetchRoute.default, { log: noop });

global.assert = require('assert');
global.Vue = require('vue');
global.store = new Vuex.Store({});

window.URLSearchParams = require('url-search-params');
window.fetch = () => Promise.resolve({ json: () => ({ data: {} }) });

Vue.config.devtools = false;
Vue.config.productionTip = false;

Vue.$fetchRoute.connect(global.store);

describe('vue-router', function() {
    require('./decorate-records.spec');
    require('./connect.spec');

    afterEach(() => {
        global.store.dispatch('vue-fetch-route/flushCache');
    });
});
