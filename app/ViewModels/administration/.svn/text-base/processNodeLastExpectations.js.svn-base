define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.isCreatingCategory = ko.observable(false).extend({ toggle: null });

        that.selectedProcessId = ko.observable();
        that.selectedProcess = ko.computed({
            read: function () {
                return that.selectedProcessId();
            },
            write: function (value) {
                that.selectedProcessId(value);
                that.loadProcess();
            }
        });

        that.processes = ko.observableArray([]);
        that.categories = ko.observableArray([]);
        that.ratings = ko.observableArray([]);

        that.currentProcessesVM = null;

        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
            return that.loadData();
        };

        that.loadData = function () {
            that.loadProcessList();
            that.loadRatings();
        };

        that.refreshSidebar = function (id) {
            if (id == that.selectedProcessId()) {
                that.loadProcess();
            }
        };
        
        /*
        * @brief:  Searches for expectations in the current year 
        *           and disables those expectation that were already added
        */
        that.disableUsedNodes = function () {
            if (that.currentProcessesVM != null && that.currentProcessesVM.categories() != null) {
                var currentCategories = that.currentProcessesVM.categories()

                //searches for categories in the currentYearVM
                _.each(that.categories(), function (category) {
                    var matchForCategory = _.find(currentCategories, function (currentCategory) {
                        return category.Title == currentCategory.Title && currentCategory.Enable;
                    });

                    if (matchForCategory != null) {
                        //disables the category found
                        category.isEnabled(false);

                        //searches for expectations in the category found
                        _.each(category.Children, function (expectation) {
                            var matchForExpectation = _.find(matchForCategory.Children, function (currentExpectation) {
                                return expectation.Title == currentExpectation.Title && currentExpectation.Enable;
                            });

                            if (matchForExpectation != null) {
                                expectation.isEnabled(false);
                            }
                            else {
                                expectation.isEnabled(true);
                            };
                        });
                    }
                    else {
                        //enables the category and its children
                        category.isEnabled(true);
                        _.each(category.Children, function (expectation) {
                            expectation.isEnabled(true);
                        });
                    };
                });
            }
        };

        that.loadProcessList = function () {
            dataservice.process.GetAllProcesses()
            .then(function (data) {
                that.processes(data);
            })
            .fail()
            .always();
        };

        that.loadRatings = function () {
            dataservice.rating.Get()
            .then(function (data) {
                that.ratings(data);
            })
            .fail()
            .always();
        };

        that.loadProcess = function loadProcess() {
            if (that.selectedProcessId() != null) {
                dataservice.process.GetWithEnabledExpectations(that.selectedProcessId())
                .then(function (data) {
                    that.extendCategories(data.Expectations);
                    that.categories(data.Expectations);
                    that.disableUsedNodes();
                })
                .fail()
                .always();
            }
        };

        that.extendCategories = function (categories) {
            _.each(categories, function (category) {
                category.isEnabled = ko.observable(true);
                _.each(category.Children, function (expectation) {
                    expectation.isEnabled = ko.observable(true);
                });
            });
        };

        that.addExpectation = function (category, expectation) {
            console.log('expectation');
            that.currentProcessesVM.addExistingExpectation(expectation, category);
        };

        that.addCategory = function (item) {
            console.log('cateogry');
            $('.processNodeCurrentProcess').animate({ scrollTop: $('.processNodeCurrentProcess .listOfCategories').height() }, 1000);
            that.currentProcessesVM.addExistingCategory(item);
        };

        that.selectPreviousProcess = function (currentYear) {
            var previousYear = currentYear - 1;

            var previousProcess = _.find(that.processes(), function (item) {
                return item.Year === previousYear;
            });

            if (previousProcess != null) {
                that.selectedProcessId(previousProcess.Id);
                that.loadProcess();
            }
        };

        that.sellectAll = function (item) {
        };

        window.expectationVM = that;
        return that;
    }

    return {
        getVM: getVM
    };
});