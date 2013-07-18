(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    requirejs.config(
        {
            // Let require.js load all app/custom modules asynchronously as needed.
            // They are all in this folder.
            // If we bundle this foler, this is not needed. But if we don't bundle, we need this.
            baseUrl: EPMC.constants.appUrl + 'scripts/app' /* script default location */

            // List paths to js files that are not in the baseUrl and not in bundles.
            // If we use the non-amd versions of 3rd libs we can bundle them instead.
            // In which case we don;t need the paths.
            // Example:
            //paths: {
            //    'knockout.changetracker': '../lib/knockout.changetracker-amd',
            //}
        }
    );

    // Load the 3rd party libraries
    registerNonAmdLibs();
    // Load our app/custom plug-ins and bootstrap the app
    loadExtensionsAndBoot();

    function registerNonAmdLibs() {
        // Load the 3rd party libraries that the app needs.
        // These are in the bundle (BundleConfig.cs).
        // These are the core libraries that many others depend on.
        define('jquery', [], function () { return root.jQuery; });
        define('ko', [], function () { return root.ko; });
        define('amplify', [], function () {
            configureAmplify(root.amplify);
            return root.amplify;
        });
        define('storage', [], function () { return { store: root.amplify.store }; });
        define('komapping', [], function () { return root.ko.mapping; });
        define('kovalidation', [], function () { return root.ko.validation; });
        define('infuser', [], function () { return root.infuser; });
        define('moment', [], function () { return root.moment; });
        //define('sammy', [], function () { return root.Sammy; });
        define('toastr', [], function () { return root.toastr; });
        define('underscore', [], function () { return root._; });
        define('bootstrap', [], function () { return root.bootbox; });
        define('bootbox', [], function () { return root.bootbox; });
        define('firstLoadManager', [], function () {
            var def = $.Deferred();
            var promise = def.promise();
            promise.ready = function () {
                //console.log('ready');
                def.resolve();
            };
            return promise;
        });
    }

    function configureAmplify(amplify) {
        //console.log('configuring amplify');
        //envelope to pass errors as json instead of text
        if (!amplify.request.decoders.appEnvelope) {
            amplify.request.decoders.appEnvelope =
                function (data, status, xhr, success, error) {
                    if (xhr.status < 400)
                        success(data);
                    else {
                        error($.parseJSON(xhr.responseText), status);
                    }
                };
        }
        //amplify definitions

        //default api
        function getSettings(type, relativeUrl) {
            return {
                url: window.EPMC.constants.appUrl + (relativeUrl || 'Api/{controller}Api/{id}'),
                type: type,
                dataType: 'json',
                decoder: 'appEnvelope'
            };
        }

        if (!amplify.request.resources['get'])
            amplify.request.define('get', 'ajax', getSettings('GET'));

        if (!amplify.request.resources['post'])
            amplify.request.define('post', 'ajax', getSettings('POST'));

        if (!amplify.request.resources['put'])
            amplify.request.define('put', 'ajax', getSettings('PUT'));

        if (!amplify.request.resources['del'])
            amplify.request.define('del', 'ajax', getSettings('DELETE'));

        if (!amplify.request.resources['getaction'])
            amplify.request.define('getaction', 'ajax', getSettings('GET', 'Api/{controller}Api/{action}'));

        if (!amplify.request.resources['postaction'])
            amplify.request.define('postaction', 'ajax', getSettings('POST', 'Api/{controller}Api/{action}'));

        if (!amplify.request.resources['putaction'])
            amplify.request.define('putaction', 'ajax', getSettings('PUT', 'Api/{controller}Api/{action}'));

        if (!amplify.request.resources['delaction'])
            amplify.request.define('delaction', 'ajax', getSettings('DELETE', 'Api/{controller}Api/{action}'));
    }

    // Load our app/custom plug-ins and bootstrap the app
    function loadExtensionsAndBoot() {
        // Require that these custom plugins be loaded now
        // so that we don't have to name them specifically in 
        // the modules that make use of them because
        // we don't want those modules to know that they use plugins.
        requirejs([
        // These plugins use "define" and we need to load them, so we kick them off here.
                'ko.bindingHandlers.enable',  // Knockout custom binding handlers
                'jquery.activity-ex',           // AMD jquery plugin that self-installs; loaded in bundle
                'ko.asyncCommand',              // Knockout custom asyncCommand
                'ko.bindingHandlers',           // Knockout custom binding handlers
                'ko.bindingHandlers.activity',  // Knockout custom binding handlers
                'ko.bindingHandlers.visibility',  // Knockout custom binding handlers
                'ko.bindingHandlers.command',   // Knockout custom binding handlers
                'ko.bindingHandlers.confirm',   // Knockout custom binding handlers
                'ko.bindingHandlers.datepicker',   // Knockout custom binding handlers
        //'ko.bindingHandlers.watermark',   // Knockout custom binding handlers
        //'ko.debug.helpers',             // Knockout debugging plugin for the app
        //'ko.dirtyFlag',                 // Knockout dirtyFlag
                'ko.extenders.numeric',
                'ko.extenders',
                'ko.utils'                      // Knockout custom utilities
        ], boot);
    }

    function boot() {
        // Start-up the app, now that all prerequisites are in place.

        if (typeof Object.create !== 'function') {
            //console.log('Object.create');
            Object.create = function (o) {
                var F = function () { };
                F.prototype = o;
                return new F();
            };
        }

        //TODO: Move this to a proper utility library for extension methods
        _.mixin({
            remove: function (list, el) {
                return _.without(list, el);
            }
        }
        );

        Function.prototype.method = function (name, func) {
            if (!this.prototype[name]) {
                this.prototype[name] = func;
                return this;
            }
        };
        infuser.defaults.templateSuffix = "";
        infuser.defaults.templateUrl = EPMC.constants.appUrl + "Administration";
        //infuser.defaults.useLoadingTemplate = false;
        infuser.defaults.loadingTemplate.content = '<div id="ignore" ></div>';

        ko.validation.init({
            errorClass: 'invalid',
            errorElementClass: 'invalid',
            insertMessages: false,
            decorateElement: true
        });

        require(['bootstrapper'],
            function (bs) {
                bs.run();
            });
    }

})();