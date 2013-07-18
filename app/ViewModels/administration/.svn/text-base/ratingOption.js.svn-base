define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/masterData'],
function (ko, toastr, dataservice, utils, masterData, literals) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        spec.repository = spec.repository || 'ratingOption';
        spec.deleteItemMsg = 'Rating option deleted successfully';
        spec.createdItemMsg = 'Rating option created successfully';
        spec.updatedItemMsg = 'Rating option update successfully';
        spec.deleteItemConfirm = 'Are you sure you want to delete Rating option?';
        var that = masterData.getVM(spec, privates);
        that.RatingId = spec.RatingId;
        var createEmptyItemBase = privates.createEmptyItem;
        privates.createEmptyItem = function (item) {
            item = item || {};
            $.extend(item, {
                Id: null,
                Name: null,
                Description: null,
                Weight: null,
                IsTextRequired: false,
                RatingId: that.RatingId
            });
            return createEmptyItemBase(item);
        };
        that.loadData = function () {
            //override load to prevent request
        };
        that.loadItems = function (data) {
            _(data).each(privates.extendItem);
            that.items(data);
        };
        return that;
    }

    return {
        getVM: getVM
    };
});


