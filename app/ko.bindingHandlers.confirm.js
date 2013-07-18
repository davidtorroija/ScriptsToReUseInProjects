define(
['jquery', 'ko', 'utils'],
function ($, ko, utils) {
    var unwrap = ko.utils.unwrapObservable;

    ko.bindingHandlers['confirm'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var confirm = ko.utils.unwrapObservable(valueAccessor());
            if (confirm.enabled === undefined) {
                confirm.enabled = true;
            }
            ko.bindingHandlers['click']['init'](
                element,
                function () {
                    return function () {
                        var args = arguments;
                        var bigIconDialog = '';
                        if (confirm.iconType == 'alert') {
                            var bigIconDialog = '<span class="iconProperties thisActionNeedsConfirmSS"></span><br/>';
                        };
                        if (ko.utils.unwrapObservable(confirm.enabled)) {
                            bootbox.confirm(utils.format(bigIconDialog + confirm.question, confirm.questionparams || []), function (ok) {
                                if (ok)
                                    confirm.click.apply(this, args);
                            });
                        } else {
                            confirm.click.apply(this, args);
                        }
                    };
                },
                allBindingsAccessor,
                viewModel);
        }
    };
    ko.bindingHandlers['confirmNativo'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var confirm = ko.utils.unwrapObservable(valueAccessor());
            ko.bindingHandlers['click']['init'](
            element,
            function () {
                return function () {
                    var args = arguments;
                    if (confirm(utils.format(confirm.question, confirm.questionparams || []))) {
                        confirm.click.apply(this, args);
                    }
                };
            },
            allBindingsAccessor,
            viewModel);
        }
    };
    ko.bindingHandlers['console'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            //console.log(val);
        }
    };
});
