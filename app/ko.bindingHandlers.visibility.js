// By: Hans Fjällemark and John Papa
// https://github.com/CodeSeven/KoLite

define('ko.bindingHandlers.visibility',
['jquery', 'ko'],
function ($, ko) {
    ko.bindingHandlers['visibility'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = !(element.style.visibility === "hidden");
            if (value && !isCurrentlyVisible)
                element.style.visibility = "visible";
            else if ((!value) && isCurrentlyVisible)
                element.style.visibility = "hidden";
        }
    };
});