define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/masterData', 'viewModels/administration/ratingOption'],
function (ko, toastr, dataservice, utils, masterData, ratingOption) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        spec.repository = spec.repository || 'rating';
        spec.deleteItemMsg = 'Rating deleted successfully';
        spec.createdItemMsg = 'Rating created successfully';
        spec.updatedItemMsg = 'Rating update successfully';
        spec.deleteItemConfirm = 'Are you sure you want to delete the rating?';
        var that = masterData.getVM(spec, privates);
        that.deleteChildItemConfirm = 'Are you sure you want to delete the rating value?';
        that.saveItemConfirm = 'Are you sure you want changes made on rating set?';
        var createEmptyItemBase = privates.createEmptyItem;
        privates.createEmptyItem = function (item) {
            item = item || {};
            $.extend(item, {
                Id: null,
                Name: null,
                Description: null,
                Type: null,
                Options: []
            });

            var rating = createEmptyItemBase(item);
            that.newItemChild(rating);
            that.newItemChild(rating);

            $('.mainFrame').animate({ scrollTop: $('.mainFrame .listOfRatingValues').height() }, 1000);

            return rating;
        };
        var baseExtendItem = privates.extendItem;
        privates.extendItem = function (item) {
            item.Enabled = true;
            baseExtendItem(item);
            _(item.Options).each(baseExtendItem);
            item.items = ko.observableArray(item.Options);
            item.oldItems = $.extend(true, [], item.Options);
        };

        that.deleteItem = function (item) {
            that.isLoading(true);

            privates.repository.CanModify({ ratingId: item.Id })
            .then(function (canModify) {
                if (canModify) {
                    bootbox.confirm('Do you want to delete the selected rating?', function (ok) {
                        if (ok) {
                            privates.repository.Delete(privates.getCleanItem(item))
                            .then(function (data) {
                                toastr.success('Rating deleted successfuly');
                                privates.callbacks.deleteItemThen(item, data);
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off);
                        }
                    });
                } else {
                    bootbox.confirm('The rating will be disabled because its used in a review.', function (ok) {
                        if (ok) {
                            privates.repository.Disable({ ratingId: item.Id })
                            .then(function (data) {
                                toastr.success('Rating disabled successfuly');
                                privates.callbacks.updateItemThen(item, data);
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off);
                        }
                    });
                }
            })
            .fail(utils.handleError)
            .always(that.isLoading.off());
        };

        privates.createChildEmptyItem = function (item) {
            item = item || {};
            $.extend(item, {
                Id: null,
                Name: null,
                Description: null,
                Weight: null,
                IsTextRequired: false//,
                //RatingId: null
            });
            baseExtendItem(item);
            return item;
        };

        var baseUpdateItem = that.updateItem;
        that.updateItem = function (item) {
            item = $.extend({}, item);
            var options = _(item.items()).map(function (el) {
                return ko.mapping.toJS(el.temporal);
            });
            item.temporal.Options(options);
            return baseUpdateItem(item);
        };
        var baseCreateItem = that.createItem;
        that.createItem = function (item) {
            item = $.extend({}, item);
            var options = _(item.items()).map(function (el) {
                return ko.mapping.toJS(el.temporal);
            });
            item.temporal.Options(options);
            return baseCreateItem(item);
        };
        that.newItemChild = function (item) {
            var child = privates.createChildEmptyItem({ RatingId: item.Id });
            item.items.push(child);
        };
        that.deleteChildItem = function (parent, childItem) {

            if (parent.items().length >= 3) {
                parent.items.remove(childItem);
            }
            else {
                toastr.error('Please enter at least 2 rating options');
            }
        };

        var baseCancel = that.cancel;
        that.cancel = function (item) {

            item.items($.extend(true, [], item.oldItems));
            baseCancel(item);
        };

        var baseSave = that.save;
        that.save = function (item) {
            console.log('Name: ', item.temporal.Name());
            var error = false;
            var nameArray = Array();

            $.each(item.items(), function (index, value) {
                if (!value.temporal.Name()) {
                    toastr.error('The Value Name is required');
                    error = true;
                }
                else {
                    nameArray.push(value.temporal.Name());
                }
            });

            if (!item.temporal.Name()) {
                toastr.error('The Set Name is required');
                error = true;
            }

            if (_.uniq(nameArray).length != nameArray.length) {
                toastr.error('The rating values name must be different');
                error = true;
            }

            if (!error) {
                baseSave(item);
            }
        };

        window.ratingVM = that;
        return that;
    }

    return {
        getVM: getVM
    };
});


