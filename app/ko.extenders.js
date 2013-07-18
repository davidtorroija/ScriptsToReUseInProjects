define(
['jquery', 'ko'],
function ($, ko) {
    ko.extenders.toggle = function (target, options) {
        //create a toggle function to change value
        target.toggle = function (vm, evnt) {
            //console.log(target);
            target(!target());
        };
        target.on = function (vm, evnt) {
            //console.log(target);
            target(true);
        };
        target.off = function (vm, evnt) {
            //console.log(target);
            target(false);
        };
        return target;
    };
});