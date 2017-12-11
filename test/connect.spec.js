/* globals assert, Vue */
describe('connect', () => {
    let TestComponent;
    let PluginStore;

    beforeEach(function() {
        TestComponent = new Vue({ store: global.store });
        PluginStore = TestComponent.$store.state['vue-fetch-route'];
    });

    it('should expose the plugin API', () => {
        assert.equal(typeof Vue.$fetchRoute.connect, 'function');
    });

    it('should have created a namespaced vuex module with correct defaults', () => {
        assert.equal(PluginStore.isLoading, false, 'exposes the loading flag');
        assert.deepEqual(PluginStore.routes, {}, 'exposes the routes store');
    });
});
