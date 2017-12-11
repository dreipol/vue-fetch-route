/* globals assert, Vue */

describe('invoke-fetch', () => {
    const { invokeFetch } = Vue.$fetchRoute;

    it('should expose the plugin API', () => {
        assert.equal(typeof invokeFetch, 'function');
    });

    it('returns a promise', () => {
        const decoratedRoutes = Vue.$fetchRoute.decorateRecords(global.routes);

        assert.equal(typeof invokeFetch(decoratedRoutes[1]).then, 'function', 'fetch method returns a promise');
    });
});
