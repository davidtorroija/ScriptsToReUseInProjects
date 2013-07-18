// By: Hans Fjällemark and John Papa
// https://github.com/CodeSeven/KoLite

define('ko.bindingHandlers.activity',
['jquery', 'ko'],
function ($, ko) {
    ko.bindingHandlers.activity = {
        init: function (element) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).activityEx(false);
            });
        },

        update: function (element, valueAccessor) {
            var activity;            
            if (typeof valueAccessor() == 'function') {                
                activity = valueAccessor()();
            }
            else {
                activity = valueAccessor();
            };

            typeof activity !== 'boolean' || $(element).activityEx(activity);
        }
    };
});