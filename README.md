# vue-fetch-route

This npm package provides various helper methods to ease the pain of fetching, storing and reaccessing route based data
with `vue`, `vuex` and `vue-router`.

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]

## Purpose
The package is intended to work in tandem with django-cms and its two plugins [`djangocms-spa`](https://github.com/dreipol/djangocms-spa) and [`djangocms-spa-vue-js`](https://github.com/dreipol/djangocms-spa-vue-js). 
However, these helpers might also come in handy for other environments and are not at all coupled to python or django.

## Quickstart

1.  Install the module

    ```bash
    npm install -S vue-fetch-route 
    ```

1.  Register the plugin to your Vue instance

    ```js
    import VueFetchRoute from 'vue-fetch-route';
    Vue.use(VueFetchRoute);
    ```

1.  Initialize `vuex` and use `connect` to register the plugin to your store. <br> 
    Please see also [Route records - Additional fields](#route-records---additional-fields)

    ```js
    const store = new Vuex.Store();
    const unsync = Vue.$fetchRoute.connect(store);
    ```

1.  Initialize `vue-router` and use `decorateRecords` to prepare your route records

    ```js
        const myRoutes = [/* your route records */];

        const router = new VueRouter({
            routes: Vue.$fetchRoute.decorateRecords(myRoutes)
        });
    ```

1.  Init your app, use `invokeFetch` in your page components to initialize a data fetch

    ```js
    const App = new Vue({
        store,
        router,
    }); 
    
    const PageComponent = {
        beforeRouteEnter(to, from, next) {
            const Fetched = Vue.$fetchRoute.invokeFetch(to);
            next(vm => {
                Fetched.then(data => {
                    vm.$set(vm.$data, 'routeData', data);
                });
            });
        },
        beforeRouteUpdate(to, from, next) {
            const Fetched = Vue.$fetchRoute.invokeFetch(to);
            Fetched.then(data => this.$set(this.$data, 'routeData', data));
            next();
        },
    };
    ```

## Necessary polyfills

The plugin uses the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) API internally 
to compile fetch and storage urls. You should add the [url-search-params polyfill](https://www.npmjs.com/package/url-search-params) 
for MS Edge and Internet Explorer support. For detailed support tables, see the caniuse [support table](https://caniuse.com/#search=URLSearchParams).

## Route records - Additional fields

To enable automatic fetch, your RouteConfigs need a few more properties to work with this plugin.
This is a full example with all the possible keys and values of an enhanced route:

```js
const route = {
    'path': '/user/:username/dashboard', // basic vue-router property
    'name': 'user-dashboard', // basic vue-router property
    'component': UserDashboard, // basic vue-router property
    'api': {
        'fetch': { 
            // Provide the raw url under which the page data can be fetched
            'url': '/api/user/:username/dashboard',
            // This query object will be added to the url before fetching
            'query': {
                // Load those partials when navigating to this route
                'partials': ['menu', 'footer'],
            }, 
            // Allow or disallow caching the route data in the vuex store 
            'useCache': true 
        },
        // It's possible to prefill one or all of the pages with initial data to avoid fetching altogether!
        'fetched': {
            'response': {
                // These are basic page data that can be inserted into the page
                'data': { 'title': 'Welcome back, robomaiden!' },
                // This is a special object that contains shared component data like a menu or a footer
                'partials': {
                    'menu': { 'home': '/' },
                    'footer': { 'text': 'say hello to the footer' },
                }
            },
            // In order to store the response under the right url, we need params and the query:
            'params': { 'username': 'robomaiden' }, 
            'query': {  
                'partials': ['menu', 'footer'], 
                'favs': 'pokémon'
            }
        } 
    },
}
```

### A word about `partials`

Partials are intended to work as data equivalents to `static placeholders` from django-cms. Those are cached separately
and won't be requested a second time. Using partials is completely optional.

## Vuex state

Please note that the plugin's default vuex namespace is `vue-fetch-route`. 
So to access the plugin store you need to load the getters like this:

```js
const MyVueComponent = {
    computed: {
        ...mapState('vue-fetch-route', [/* properties */]),
    },
};
```

You can change this name in the [plugin config](#config).

### `isLoading`
When a fetch request is pending the plugin's vuex module flag `isLoading` is set to `true`:

```vue
<template>
    <my-vue-component>
        <my-vue-loader v-if="isLoading"></my-vue-loader>
        <div v-if="!isLoading">
              <h1 v-text="routeData.title"></h1>  
        </div>            
    </my-vue-component>
</template>

<script>
    const MyVueComponent = {
        computed: {
            ...mapState('vue-fetch-route', ['isLoading']),
        },
    };
</script>
```

### `partials`
If you have shared data on multiple pages, for example a menu or a footer, you may want to store their data centrally.
For this purpose, you can use the special `partials` object:

```vue
<template>
    <my-vue-menu v-if="partials.menu">
        <!-- menu content -->          
    </my-vue-menu>
</template>

<script>
    const MyVueMenu = {
        computed: {
            ...mapState('vue-fetch-route', ['partials']),
        },
    };
</script>
```

### `routes`
This routes dictionary contains the stored promises of visited pages. You shouldn't need to interact with it by yourself 
as accessing them is already done automatically via the `invokeFetch` method in your page components.


## Plugin config

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### log

Log method to gain some insights about route navigation and data storing

Default: `window.console.log`

### warn

Warn method to notify about possible errors

Default: `window.console.warn`

### fetch

Method used to invoke when fetching data

**Parameters**

-   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** A fetch url

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise resolving with the route data

Default
```js
    const config = {
        fetch(url) {
            return new Promise((resolve, reject) => {
                window.fetch(url).then(
                    response => resolve(response.json()),
                    error => reject(error)
                );
            });
        },
    };
```

### ignoredQueryParams

A list of query params that are ignored when defining the key to store the data.<br>
This is important to avoid storing data copies of the same route under different keys.

Default: `[]`

### vuexModule

The name that is used to register the vuex module to the store

Default: `vue-fetch-route`

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### connect

Wire up a vuex store with the app

**Parameters**

-   `store` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** A vuex store containing the `router` module

Returns **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Unsync function

### decorateRecords

Route config creation helper

**Parameters**

-   `records` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** A route record array describing a list of available routes (optional, default `[]`)
-   `middlewares` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** A list of middlewares to apply to each route (also recursively) (optional, default `[]`)
-   `parents` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The records' parental hierarchy, the first item being the oldest (optional, default `[]`)

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The enhanced route records, ready for being used by `vue-router`

### compareRecords

Compare two route definitions, ignoring irrelevant information such as hash

**Parameters**

-   `to` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** A route record describing the previous location
-   `from` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** A route record describing the next location

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** A flag indicating if two records are identical

### invokeFetch

Start a fetch request

**Parameters**

-   `route` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** A route descriptor object
    -   `route.meta` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The route's meta property
    -   `route.params` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All currently active params
    -   `route.query` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The currently active query object

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise returning route data of a page


## 
[travis-image]: https://img.shields.io/travis/dreipol/vue-fetch-route.svg?style=flat-square
[travis-url]: https://travis-ci.org/dreipol/vue-fetch-route
[license-image]: http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]: LICENSE
[npm-version-image]: http://img.shields.io/npm/v/vue-fetch-route.svg?style=flat-square
[npm-downloads-image]: http://img.shields.io/npm/dm/vue-fetch-route.svg?style=flat-square
[npm-url]: https://npmjs.org/package/vue-fetch-route
