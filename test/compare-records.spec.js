/* globals assert, Vue */

describe('compare-records', () => {
    let TestComponent;
    let PluginStore;

    beforeEach(function() {
        TestComponent = new Vue({ store: global.store });
        PluginStore = TestComponent.$store.state['vue-fetch-route'];
    });

    it('should expose the plugin API', () => {
        assert.equal(typeof Vue.$fetchRoute.compareRecords, 'function');
    });

    it('compares two route records with each other', () => {
        const { compareRecords } = Vue.$fetchRoute;
        const records = {
            a: { name: 'route-a' },
            b: { name: 'route-a', params: {}, query: {} },
            c: { name: 'route-a', params: { foo: 'x' } },
            d: { name: 'route-b', params: { foo: 'y' } },
            e: { name: 'route-b', params: { foo: 'y' }, query: { partials: ['foo'] } },
        };

        assert.equal(compareRecords(records.a, records.b), true, 'detects page similarity');
        assert.notEqual(compareRecords(records.b, records.c), true, 'detects page differences');
        assert.equal(compareRecords(records.d, records.e), true, 'detects page similarity while ignoring ignored query params');
    });
});
