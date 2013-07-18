define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/masterData', 'literals'],
function (ko, toastr, dataservice, utils, masterData, literals) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        spec.repository = spec.repository || 'appSettings';
        spec.updatedItemMsg = 'Setting updated successfully';
        spec.deleteItemConfirm = literals.deleteFeedbackOptionConfirm;
        var that = masterData.getVM(spec, privates);
        that.save = function (item) {
            if (item.temporal.Value()) {
                item.temporal.Value(item.temporal.TypedValue().toString());
                return that.updateItem(item);
            } else {
                toastr.error('Your must complete Value field.');
            }
        };
        that.cancel = function (item) {
            item.isEditing(false);
            item.undo();
        };

        return that;
    }

    return {
        getVM: getVM
    };
});


