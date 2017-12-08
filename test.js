/* eslint-env node, mocha */

require('jsdom-global')();
const assert = require('assert');
const Vue = require('vue');
const Vuex = require('vuex');
const VueRouter = require('vue-router');
const VueRouteFetch = require('./dist');


describe('Tests', function() {
    it('stub', function() {
        assert.equal(true, true);
    });
});
