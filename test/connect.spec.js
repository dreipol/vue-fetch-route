/* globals assert, Vue */

describe('connect', () => {
    const { connect } = Vue.$fetchRoute;
    let PluginStore;

    beforeEach(function() {
        const TestComponent = new Vue({ store: global.store });
        PluginStore = TestComponent.$store.state['vue-fetch-route'];
    });

    it('should expose the plugin API', () => {
        assert.equal(typeof connect, 'function');
    });

    it('should have created a namespaced vuex module with correct defaults', () => {
        assert.strictEqual(PluginStore.isLoading, false, 'exposes the loading flag');
        assert.deepEqual(PluginStore.routes, {}, 'exposes the routes store');
        assert.deepEqual(PluginStore.partials, {}, 'exposes the partials store');
    });

    it('should handle the loading flag correctly', done => {
        const decoratedRoutes = Vue.$fetchRoute.decorateRecords(global.routes);
        const request = decoratedRoutes[1].meta.api.fetch();

        assert.strictEqual(PluginStore.isLoading, true, 'activates `isLoading` when a request is pending');
        request.then(() => {
            assert.strictEqual(PluginStore.isLoading, false, 'disables `isLoading` when the request is done');
            done();
        });
    });
});
