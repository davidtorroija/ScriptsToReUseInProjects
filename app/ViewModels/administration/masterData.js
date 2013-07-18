define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};
        privates.repository = dataservice[spec.repository];
        privates.deleteItemMsg = spec.deleteItemMsg || 'Deleted Successfully';
        privates.createdItemMsg = spec.createdItemMsg || 'Saved Successfully';
        privates.updatedItemMsg = spec.updatedItemMsg || 'Saved Successfully';
        privates.callbackStrategies = {
            server: {
                createItemThen: function (item, data) {
                    //console.log('createItemThen server');
                    that.loadData();
                },
                updateItemThen: function (item, data) {
                    //console.log('updateItemThen server');
                    that.loadData();
                },
                deleteItemThen: function (item, data) {
                    //console.log('deleteItemThen server');
                    that.loadData();
                }

            },
            client: {
                createItemThen: function (item, data) {
                    //console.log('createItemThen client');
                    $.extend(item, data);
                    item.isEditing(false);
                    item.undo();
                },
                updateItemThen: function (item, data) {
                    //console.log('updateItemThen client');
                    $.extend(item, data);
                    item.isEditing(false);
                    item.undo();
                },
                deleteItemThen: function (item, data) {
                    //console.log('deleteItemThen client');
                    that.items.remove(item);
                }
            }
        };
        privates.callbacks = privates.callbackStrategies[spec.callbackStrategy || 'server'];
        that.deleteItemConfirm = spec.deleteItemConfirm;
        that.items = ko.observableArray();
        that.isLoading = ko.observable(false).extend({ toggle: null });
        that.isVisible = ko.observable(false).extend({ toggle: null });
        privates.extendItem = function (item) {
            item.temporal = ko.mapping.fromJS(item);
            item.isEditing = ko.observable(false);
            item.undo = function () {
                for (prop in item) {
                    if (ko.isObservable(item.temporal[prop])) {
                        item.temporal[prop](item[prop]);
                    }
                }
            };
        };
        privates.unextendItem = function (item) {
            delete item.temporal;
            delete item.isEditing;
            delete item.undo;
        };
        privates.getCleanItem = function (item) {
            item = $.extend({}, item);
            privates.unextendItem(item);
            return item;
        };
        that.loadData = function () {
            that.isLoading(true);
            return privates.repository.Get()
                .fail(utils.handleError)
                .then(function (data) {
                    _(data).each(privates.extendItem);
                    that.items(data);
                })
                .always(that.isLoading.off)
                ;
        };

        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
            return that.loadData();
        };
        that.editItem = function (item) {
            //console.log('edit ' + spec.repository, item);
            _(that.items()).each(that.cancel);
            item.isEditing(true);
        };
        that.deleteItem = function (item) {
            //console.log('delete ' + spec.repository);
            that.isLoading(true);
            return privates.repository.Delete(privates.getCleanItem(item))
                .fail(utils.handleError)
                .then(function (data) {
                    privates.callbacks.deleteItemThen(item, data);
                    toastr.success(privates.deleteItemMsg);
                })
                .always(that.isLoading.off)
                ;
        };
        that.createItem = function (item) {
            //console.log('create ' + spec.repository);
            that.isLoading(true);
            return privates.repository.Add(ko.mapping.toJS(item.temporal))
                .fail(function (error) {
                    utils.handleError(error);
                    that.isLoading.off();
                })
                .then(function (data) {
                    privates.callbacks.createItemThen(item, data);
                    toastr.success(privates.createdItemMsg);
                })
                .always(that.isLoading.off)
                ;
        };
        that.updateItem = function (item) {
            //console.log('update ' + spec.repository);
            that.isLoading(true);
            return privates.repository.Update(ko.mapping.toJS(item.temporal))
                .fail(function (error) {
                    utils.handleError(error);
                    that.isLoading.off();
                })
                .then(function (data) {
                    privates.callbacks.updateItemThen(item, data);
                    toastr.success(privates.updatedItemMsg);
                })
                .always(that.isLoading.off)
                ;
        };
        privates.createEmptyItem = function (item) {
            item = item || {};
            privates.extendItem(item);
            item.isEditing(true);
            return item;
        };
        that.newItem = function () {
            //console.log('newItem ' + spec.repository);
            _(that.items()).each(that.cancel);
            that.items.push(privates.createEmptyItem());
        };
        that.save = function (item) {
            //console.log('save ' + privates.repository);
            if (item.Id) {
                return that.updateItem(item);
            } else {
                return that.createItem(item);
            }
        };
        that.cancel = function (item) {
            console.log('item cancel ' , item);
            
            item.isEditing(false);
            if (item.Id) {
                item.undo();
            } else {
                that.items.remove(item);
                delete item;
            }
        };
        return that;
    }

    function getSectionsVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
        };

        //sections
        privates.selectedVM = null;
        privates.selectVM = function (vm) {
            if (privates.selectedVM)
                privates.selectedVM.isVisible(false);
            privates.selectedVM = vm;
            if (vm) {
                privates.selectedVM.isVisible(true);
            }
        };

        //app_settings
        that.appSettingsVM = ko.observable();
        var loadAppSettings = function (viewmodel, evnt) {
            if (!that.appSettingsVM()) {
                require(['viewmodels/administration/appSettings'], function (appSettings) {
                    var vm = appSettings.getVM();
                    ko.applyBindingsToNode($('#appSettings_administration').get(0), { template: { name: 'app_settings'} }, vm);

                    privates.selectVM(vm);
                    that.appSettingsVM(vm);
                    vm.loadData();
                });
            } else {
                if (privates.selectedVM != that.appSettingsVM()) {
                    privates.selectVM(that.appSettingsVM());
                    that.appSettingsVM().loadData();
                }
            }
        };
        that.loadAppSettings = loadAppSettings;
        that.isAppSettingsVisible = ko.computed(function () {
            return that.appSettingsVM() && that.appSettingsVM().isVisible();
        });
        that.isAppSettingsLoading = ko.computed(function () {
            return that.appSettingsVM() && that.appSettingsVM().isLoading();
        });

        //rating
        that.ratingVM = ko.observable();
        var loadRating = function (viewmodel, evnt) {
            if (!that.ratingVM()) {
                require(['viewmodels/administration/rating'], function (rating) {
                    var vm = rating.getVM();
                    ko.applyBindingsToNode($('#rating_administration').get(0), { template: { name: 'rating'} }, vm);

                    privates.selectVM(vm);
                    that.ratingVM(vm);
                    vm.loadData();
                });
            } else {
                if (privates.selectedVM != that.ratingVM()) {
                    privates.selectVM(that.ratingVM());
                    that.ratingVM().loadData();
                }
            }
        };
        that.loadRating = loadRating;
        that.isRatingVisible = ko.computed(function () {
            return that.ratingVM() && that.ratingVM().isVisible();
        });
        that.isRatingLoading = ko.computed(function () {
            return that.ratingVM() && that.ratingVM().isLoading();
        });

        //rating option
        that.ratingOptionVM = ko.observable();
        var loadRatingOption = function (viewmodel, evnt) {
            console.log('pepepe');
            if (!that.ratingOptionVM()) {
                require(['viewmodels/administration/ratingOption'], function (ratingOption) {
                    var vm = ratingOption.getVM();
                    ko.applyBindingsToNode($('#ratingOption_administration').get(0), { template: { name: 'ratingOption'} }, vm);

                    privates.selectVM(vm);
                    that.ratingOptionVM(vm);
                    vm.loadData();
                });
            } else {
                if (privates.selectedVM != that.ratingOptionVM()) {
                    privates.selectVM(that.ratingOptionVM());
                    that.ratingOptionVM().loadData();
                }
            }
        };
        that.loadRatingOption = loadRatingOption;
        that.isRatingOptionVisible = ko.computed(function () {
            return that.ratingOptionVM() && that.ratingOptionVM().isVisible();
        });
        that.isRatingOptionLoading = ko.computed(function () {
            return that.ratingOptionVM() && that.ratingOptionVM().isLoading();
        });

        window.masterDataSection = that;
        return that;
    }

    return {
        getVM: getVM,
        getSectionsVM: getSectionsVM
    };
});


