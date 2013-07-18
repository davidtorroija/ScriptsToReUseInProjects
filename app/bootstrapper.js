/*global define, $, ko, infuser, amplify */
define('bootstrapper',
    ['jquery', 'ko', 'infuser', 'amplify'],
    function ($, ko, infuser, amplify) {
        var
            run = function () {
                //presenter.toggleActivity(true);

                //config.dataserviceInit(); 

                //                $.when(dataprimer.fetch())
                //                .done(binder.bind)
                //                .done(routeConfig.register)
                //                .always(function () {
                //                    presenter.toggleActivity(false);
                //                });
                //$('#body').activity(false);
                //console.log(ko.mapping);
                //function testFunction(name, that, args) {
                //    console.debug(name + ' this', that);
                //    console.debug(name + ' arguments', args);
                //}
            };


        return {
            run: run
        };
    });