/* globals assert, Vue */

describe('decorateRecords', () => {
    beforeEach(() => {
    });

    it('should expose the plugin API', () => {
        assert.equal(typeof Vue.$fetchRoute.decorateRecords, 'function');
    });

    it('should return an array of the same size', () => {
        const routes = Object.freeze([
            { path: '/' },
            { path: '/app' },
        ]);
        const decoratedRoutes = Vue.$fetchRoute.decorateRecords(routes);

        assert.equal(Array.isArray(decoratedRoutes), true, 'is an array');
        assert.equal(decoratedRoutes.length, global.routes.length, 'has the same length');
    });

    it('only decorates records that have an `api.fetch` key', () => {
        const decoratedRoutes = Vue.$fetchRoute.decorateRecords(global.routes);

        assert.deepEqual(decoratedRoutes[0], global.routes[0], 'leaves this route alone');
        assert.notDeepEqual(decoratedRoutes[1], global.routes[1], 'transforms this route');
    });

    it('transforms a record accordingly', () => {
        const decoratedRoutes = Vue.$fetchRoute.decorateRecords(global.routes);

        assert.equal(decoratedRoutes[1].meta.hierarchy[0], global.routes[1].path, 'adds a hierarchy array');
        assert.equal(typeof decoratedRoutes[1].meta.api.fetch, 'function', 'has a fetch method');
        assert.equal(decoratedRoutes[1].meta.api.url, '/api/app', 'has a url value');
        assert.equal(typeof decoratedRoutes[1].meta.api.fetch().then, 'function', 'fetch method returns a promise');
    });
});
