/*globals define,console*/
define(['jquery'],
function ($) {
    function extend(entity) {
        //wrap entity with tracking
        //or extend with tracking
        if (!entity.tracking)
            entity.tracking = tracking(entity);
        return entity;
    }
    function unwrap(entity) {
        if (!entity.tracking) return entity;
        return copyUnwrapped(entity);
    }
    function copyUnwrapped(entity) {
        var unwraped = $.extend(true, {}, entity);
        delete unwraped['tracking'];
        //console.log('unwrap', unwraped);
        return unwraped;
    }
    function tracking(entity) {
        var that = {
            commit: function () {
                $.extend(true, entity, that.temp);
                that.modified = true;
            },
            undo: function () {
                //console.log('undo');
                that.temp = copyUnwrapped(entity);
            },
            modified: false,
            original: copyUnwrapped(entity),
            temp: copyUnwrapped(entity)
        };

        return that;
    }
    return {
        extend: extend,
        unwrap: unwrap
    };
});