// By: Hans Fjällemark and John Papa
// https://github.com/CodeSeven/KoLite

define('ko.bindingHandlers.datepicker',
['jquery', 'ko'],
function ($, ko) {
    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //console.log(ko.toJS(ko.utils.unwrapObservable(valueAccessor())));
            //console.log('valueAccessor Datepicker', valueAccessor());
            //??
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).datepicker();
            });

            
            var config = valueAccessor();

            var subscribeAttributeToUpdateDatePicker = function (attribute) {
                //var a = attribute;
                //console.log('subscribing options', attribute, config[attribute]());
                config[attribute].subscribe(function (value) {
                    //console.log('updating options', attribute, value);
                    $(element).datepicker('option', attribute, value);
                });
            }
            for (key in config) {
                if (ko.isSubscribable(config[key])) {
                    subscribeAttributeToUpdateDatePicker(key);
                }
            }

            var defaultConfig = {
                keyboardallowed: true
            };
            config = $.extend(defaultConfig, config);
            if (!config.keyboardallowed) {
                $(element).bind('keypress', function (e) {
                    if (e.keyCode == 9)       //Tab key
                    {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
            //console.log('valueAccessor Datepicker', ko.toJS(ko.utils.unwrapObservable(valueAccessor())));
            $(element).datepicker(ko.toJS(config));
        },

        update: function (element, valueAccessor) {
            //            var activity = valueAccessor()();
            //            typeof activity !== 'boolean' || 
            $(element).datepicker();
        }
    };


    ko.bindingHandlers.datepicker2 = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            console.log(ko.toJS(ko.utils.unwrapObservable(valueAccessor())));
            //??
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).datepicker();
            });
            var config = ko.utils.unwrapObservable(valueAccessor());
            for (property in config) {
                if (ko.isSubscribable(config[property])) {
                    config[property].subscribe(function () {
                        $(element).datepicker('option', ko.toJS(config));
                    });
                }
            }
        },

        update: function (element, valueAccessor) {
            //            var activity = valueAccessor()();
            //            typeof activity !== 'boolean' || 
            $(element).datepicker();
        }
    };
});