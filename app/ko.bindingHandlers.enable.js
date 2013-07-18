// Created by: David and Diego
/*globals define,$,ko*/
define('ko.bindingHandlers.enable',
    ['jquery', 'ko'],
        function ($, ko) {
            ko.bindingHandlers['enable'] = {
                'update': function (element, valueAccessor) {

                    var value = ko.utils.unwrapObservable(valueAccessor());
                    if (value && (element.disabled || $(element).attr('disabled'))) {
                        element.removeAttribute("disabled");
                        $(element).attr('disabled', false);
                    }
                    else if ((!value) && !(element.disabled || $(element).attr('disabled'))) {
                        element.disabled = true;
                        $(element).attr('disabled', true);
                    }
                }
            };
        });