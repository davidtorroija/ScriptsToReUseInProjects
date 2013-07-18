define(['utils'], function (utils) {
    //function getVM() {
        var that = {};
        that.add = function (literals) {
            $.extend(that, literals);
        };
        return that;
    //}

//    var instance = null;
//    function getSingleton() {
//        return instance || (instance = getVM());
//    }

//    return {
//        getVM: getSingleton
//    };
});