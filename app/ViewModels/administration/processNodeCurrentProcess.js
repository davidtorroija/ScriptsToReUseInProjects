define(['ko', 'toastr', 'dataservice', 'utils', 'jquery'],
function (ko, toastr, dataservice, utils, $) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.isAddingNewCategory = ko.observable(false).extend({ toggle: null });
        that.isModifyingNewCategory = ko.observable(false).extend({ toggle: null });
        that.isAddingNewExpectationForCategory = ko.observable(false).extend({ toggle: null });
        that.isModifyingNewExpectationForCategory = ko.observable(false).extend({ toggle: null });
        that.isAddingNewExpectation = ko.observable(false).extend({ toggle: null });
        that.isModifyingNewExpectation = ko.observable(false).extend({ toggle: null });
        that.shouldShowProcesses = ko.observable(false).extend({ toggle: null });

        that.lastProcessesVM = null;
        that.categories = ko.observableArray([]);
        that.process = ko.observable();
        that.yearSelected = ko.observable();
        that.processes = ko.observableArray([]);
        that.selectedProcessId = ko.observable();
        that.ratings = ko.observableArray([]);
        that.selectedCategoryId = ko.observable();
        that.selectedExpectationToModify = ko.observable();
        that.shouldShowAdvice = ko.observable(false).extend({ toggle: null });
        that.isLoading = ko.observable(false).extend({ toggle: null });

        that.showPreviousYear = function (process) {
            var previousYear = process.Year - 1;

            var previousProcess = _.find(that.processes(), function (searchedProcess) {
                return searchedProcess.Year == previousYear;
            });

            if (previousProcess != null) {
                that.hideAllForms();
                that.selectedProcessId(previousProcess.Id);
                that.loadProcess();
            }
        };

        that.showNextYear = function (process) {
            var nextYear = process.Year + 1;

            var nextProcess = _.find(that.processes(), function (searchedProcess) {
                return searchedProcess.Year == nextYear;
            });

            if (nextProcess != null) {
                that.selectedProcessId(nextProcess.Id);
                that.loadProcess();
                that.hideAllForms();
            } else {
                that.addNewProcess();
                that.isAddingNewCategory(false);
                that.isModifyingNewCategory(false);
                that.isAddingNewExpectationForCategory(false);
                that.isModifyingNewExpectationForCategory(false);
                that.isAddingNewExpectation(false);
                that.isModifyingNewExpectation(false);
            }
        };

        that.selectProcess = function (process) {
            that.selectedProcessId(process.Id);
            that.shouldShowProcesses.off()
            that.loadProcess();
            that.isAddingNewCategory(false);
            that.isModifyingNewCategory(false);
            that.isAddingNewExpectationForCategory(false);
            that.isModifyingNewExpectationForCategory(false);
            that.isAddingNewExpectation(false);
            that.isModifyingNewExpectation(false);
            that.yearSelected(true);
        };

        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
            return that.loadProcesses();
        };

        that.newCategory = {
            Id: 0,
            ParentId: 0,
            ProcessId: 0,
            CreatedById: 0,
            Title: ko.observable().extend({ required: true }),
            Description: ko.observable().extend({ required: true }),
            RatingId: 0,
            selectedRatingValue: ko.observable(),
            IsDefaultExpectation: ko.observable()
        };

        that.newExpectation = {
            Id: 0,
            ParentId: 0,
            selectedCategoryValue: ko.observable().extend({ required: true }),
            ProcessId: 0,
            CreatedById: 0,
            Title: ko.observable().extend({ required: true }),
            Description: ko.observable().extend({ required: true }),
            selectedRatingValue: ko.observable(),
            RatingId: 0,
            IsDefaultExpectation: ko.observable()
        };

        that.addNewProcess = function () {
            dataservice.process.AddNewProcess()
            .then(function (data) {
                that.selectedProcessId(data.Id);
                that.loadRatings();
                that.loadProcesses();
                that.loadProcess();
            })
            .fail(utils.handleError)
            .always();
        };

        that.categoryExists = function (category) {
            return that.findInArray(that.categories(), category);
        };

        //poner nuevo metodo save para sacar el if
        that.saveCategory = function (category) {
            if (that.categoryExists(category)) {
                toastr.error('The category already exists in the current year');
            }
            else {
                var newCategory = ko.toJS(category);

                if (newCategory.Title != "" && newCategory.Description != "") {
                    if (that.isAddingNewCategory()) {
                        newCategory.RatingId = category.selectedRatingValue();
                    }

                    delete newCategory.ParentId;
                    that.isLoading.on();
                    dataservice.expectation.Add(newCategory)
                    .then(function () {
                        that.loadProcess()
                            .then(function () {
                                $('#adminPage .mainFrame ol.listOfCategories > li:last-child').addClass('saveBoxConfirmation');
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                            })
                            .always(toastr.success('Category created successfuly'));
                    })
                    .fail(utils.handleError)
                    .always(function () {
                        that.isLoading.off();
                    });

                    that.isAddingNewCategory(false);
                }
                else {
                    toastr.error('Please enter the category title and description');
                }
            }
        };

        //poner nuevo metodo save para sacar el if
        that.saveExpectation = function (expectation, event) {

            if (that.isAddingNewExpectation()) {
                expectation.ParentId = expectation.selectedCategoryValue();
            }

            if (that.isAddingNewExpectationForCategory()) {
                expectation.ParentId = expectation.selectedCategoryValue();
            }

            var newExpectation = ko.toJS(expectation);
            delete newExpectation.RatingId;

            var parentExpectation = _(that.categories()).find(function (item) { return item.Id == expectation.ParentId; });

            if (that.findInArray(parentExpectation.Children, newExpectation)) {
                toastr.error('The expectation already exists in the current category');
            } else if (newExpectation.Title == '') {
                toastr.error('Title is required');
            }
            else {
                that.isLoading.on();
                dataservice.expectation.Add(newExpectation)
                .then(function () {
                    toastr.success('Expectation created successfuly');
                    that.loadProcess();
                    that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                })
                .fail(utils.handleError)
                .always(that.isLoading.off());

                that.isAddingNewExpectation(false);
                that.isAddingNewExpectationForCategory(false);
                that.selectedCategoryId(null);
            }
        };

        var disableExpectation = function (objectName, expectation, event) {
            bootbox.confirm('The ' + objectName + ' is used, would you like to disable the selected expectation and create a new one?', function (ok) {
                if (ok) {
                    dataservice.expectation.Disable({ expectationId: expectation.Id })
                            .then(function () {
                                $(event.target).parent().addClass('saveBoxConfirmation');
                                toastr.success('Expectation disabled successfuly');
                                that.loadProcess();
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off());
                }
            });
        };

        var updateExpectation = function (objectName, expectation) {
            expectation.Enabled = true;
            dataservice.expectation.Update(expectation)
                        .then(function () {
                            toastr.success(objectName + ' updated successfuly');
                            that.loadProcess();
                        })
                        .fail(utils.handleError)
                        .always(that.isLoading.off());
        };

        that.updateCategory = function (category) {
            if (category.Title() && category.Description()) {
                if (that.isModifyingNewCategory()) {
                    category.RatingId = category.selectedRatingValue();
                }

                var newCategory = ko.toJS(category);
                delete newCategory.ParentId;

                that.isLoading.on();
                dataservice.expectation.CanModifyExpectation(category.Id)
                .then(function (canModify) {
                    if (canModify) {
                        updateExpectation('Category', newCategory);                        
                        that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                    } else {
                        disableExpectation('Category', newCategory, event);
                    }
                })
                .fail(utils.handleError)
                .always(that.isLoading.off());

                that.hideAllForms();
            }
            else {
                toastr.error('Please enter the category title and description');
            }
        };

        that.updateExpectation = function (expectation, event) {

            var temporalParent = $(event.target).parents('li.mod').next('li');

            if (that.isModifyingNewExpectation()) {
                expectation.ParentId = expectation.selectedCategoryValue();
            }

            var newExpectation = ko.toJS(expectation);
            newExpectation.Enabled = true;

            that.isLoading.on();
            dataservice.expectation.CanModifyExpectation(expectation.Id)
            .then(function (canModify) {
                if (canModify) {
                    dataservice.expectation.Update(newExpectation)
                    .then(function () {

                        that.loadProcess()
                            .then(
                                temporalParent.addClass('saveBoxConfirmation'),
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId())
                            )
                            .always(
                            toastr.success('Expectation disabled successfuly'));
                    })
                    .fail(utils.handleError)
                    .always(that.isLoading.off());
                } else {
                    bootbox.confirm('The expectation is used, would you like to disable the selected expectation and create a new one?', function (ok) {
                        if (ok) {
                            dataservice.expectation.Disable({ expectationId: newExpectation.Id })
                            .then(function () {
                                that.loadProcess()
                                .then(
                                    temporalParent.addClass('saveBoxConfirmation'),
                                    that.lastProcessesVM.refreshSidebar(that.selectedProcessId())
                                )
                                .always(toastr.success('Expectation disabled successfuly'));
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off());
                        }
                    });
                }
            })
            .fail(utils.handleError)
            .always(that.isLoading.off());

            that.hideAllForms();
        };

        that.addExistingCategory = function (category) {
            if (that.categoryExists(category)) {
                toastr.error('The category already exists in the current year');
            }
            else {
                category.ProcessId = that.process().Id;
                that.saveCategory(category);
            }
        };

        that.addExistingExpectation = function (expectation, category) {
            expectation.ProcessId = that.process().Id;
            category.ProcessId = that.process().Id;
            var foundCategory = that.findInArray(that.categories(), category);

            console.log(foundCategory, category);

            if (foundCategory != null) {
                if (that.findInArray(foundCategory.Children, expectation)) {
                    toastr.error('The expectation already exists in the current category');
                }
                else {
                    expectation.ParentId = foundCategory.Id;
                    that.saveExpectation(expectation);
                }
            }
            else {
                category.Children = [expectation];
                that.saveCategory(category);
            }
        };

        that.findInArray = function (array, searched) {
            var searchedJS = ko.toJS(searched);
            return _.find(array, function (listItem) {
                var itemJS = ko.toJS(listItem);
                return (itemJS.Title == searchedJS.Title && itemJS.Enabled);
            })
        };

        that.removeCategory = function (category) {
            var newCategory = ko.toJS(category);

            that.isLoading.on()
            dataservice.expectation.CanModifyExpectation(newCategory.Id)
            .then(function (canModify) {
                if (canModify) {
                    bootbox.confirm('Do you want to delete the selected category?', function (ok) {
                        if (ok) {
                            dataservice.expectation.Delete(newCategory)
                            .then(function () {
                                toastr.success('Category deleted successfuly');
                                that.loadProcess();
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off());
                        }
                    });
                } else {
                    bootbox.confirm('The category will be disabled because its used in a review.', function (ok) {
                        if (ok) {
                            dataservice.expectation.Disable({ expectationId: newCategory.Id })
                            .then(function () {
                                toastr.success('Category disabled successfuly');
                                that.loadProcess();
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off());
                        }
                    });
                }
            })
            .fail(utils.handleError)
            .always(that.isLoading.off());

            that.hideAllForms();
        };

        that.removeExpectation = function (expectation) {
            var newExpectation = ko.toJS(expectation);

            that.isLoading.on()
            dataservice.expectation.CanModifyExpectation(expectation.Id)
            .then(function (canModify) {
                if (canModify) {
                    bootbox.confirm('Do you want to delete the selected expectation?', function (ok) {
                        if (ok) {
                            dataservice.expectation.Delete(newExpectation)
                    .then(function () {
                        toastr.success('Expectation deleted successfuly');
                        that.loadProcess();
                        that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                    })
                    .fail(utils.handleError)
                    .always(that.isLoading.off());
                        }
                    });
                } else {
                    bootbox.confirm('The expectation will be disabled because its used in a review.', function (ok) {
                        if (ok) {
                            dataservice.expectation.Disable({ expectationId: newExpectation.Id })
                            .then(function () {
                                toastr.success('Expectation disabled successfuly');
                                that.loadProcess();
                                that.lastProcessesVM.refreshSidebar(that.selectedProcessId());
                            })
                            .fail(utils.handleError)
                            .always(that.isLoading.off());
                        }
                    });
                }
            })
            .fail(utils.handleError)
            .always(that.isLoading.off());

            that.hideAllForms();
        };

        that.addNewCategory = function () {
            that.isAddingNewCategory.toggle();
            that.isAddingNewExpectation(false);
            that.newCategory.Title('');
            that.newCategory.Description('');
            that.newCategory.ProcessId = that.process().Id;
            that.newCategory.selectedRatingValue(null);
            $('.processNodeCurrentProcess').animate({ scrollTop: $('.processNodeCurrentProcess .listOfCategories').height() }, 1000);
        };

        that.addNewExpectation = function () {
            that.isAddingNewExpectation.toggle();
            that.isAddingNewCategory(false);
            that.newExpectation.Title('');
            that.newExpectation.Description('');
            that.newExpectation.ProcessId = that.process().Id;
            that.newExpectation.selectedCategoryValue(null);
        };

        that.addNewExpectationForCategory = function (category, event) {
            that.isAddingNewExpectationForCategory.toggle();
            that.selectedCategoryId(category.Id);

            that.newExpectation.Title('');
            that.newExpectation.Description('');
            that.newExpectation.ParentId = category.Id;
            that.newExpectation.ProcessId = that.process().Id;
            that.newExpectation.selectedCategoryValue(category.Id);
        };

        that.hideAllForms = function (category, event) {
            that.isAddingNewExpectationForCategory(false);
            that.isModifyingNewExpectationForCategory(false);
            that.isAddingNewCategory(false);
            that.isModifyingNewCategory(false);
            that.isAddingNewExpectation(false);
            that.isModifyingNewExpectation(false);
            that.selectedCategoryId(null);
            that.selectedExpectationToModify(null);
        };

        that.modifyCategory = function (category, event) {
            dataservice.expectation.CanModifyExpectation(category.Id)
            .then(function (canModify) {
                //console.log(canModify);
                if (!canModify) {
                    disableExpectation('Category', category, event);
                } else {
                    //console.log(category);
                    that.isModifyingNewCategory.toggle();
                    that.isAddingNewExpectationForCategory.off();
                    that.selectedCategoryId(category.Id);

                    that.newCategory.Id = category.Id;
                    that.newCategory.CreatedById = category.CreatedById;
                    that.newCategory.ParentId = category.ParentId;
                    that.newCategory.ProcessId = category.ProcessId;
                    that.newCategory.Title(category.Title);
                    that.newCategory.Description(category.Description);
                    that.newCategory.selectedRatingValue(category.RatingId);
                    that.newCategory.IsDefaultExpectation(category.IsDefaultExpectation);
                }
            });
        };

        that.modifyExpectation = function (expectation, event) {
            dataservice.expectation.CanModifyExpectation(expectation.Id)
            .then(function (canModify) {
                console.log(canModify);
                if (!canModify) {
                    disableExpectation('Expectation', expectation, event);
                } else {
                    that.isModifyingNewExpectation.toggle();

                    that.selectedExpectationToModify(expectation.Id);

                    that.newExpectation.Id = expectation.Id;
                    that.newExpectation.RatingId = expectation.RatingId;
                    that.newExpectation.CreatedById = expectation.CreatedById;
                    that.newExpectation.ProcessId = expectation.ProcessId;
                    that.newExpectation.Title(expectation.Title);
                    that.newExpectation.Description(expectation.Description);
                    that.newExpectation.selectedCategoryValue(expectation.ParentId);
                    that.newExpectation.IsDefaultExpectation(expectation.IsDefaultExpectation);
                }
            });
        };

        that.isEditMode = ko.computed(function () {
            return that.isAddingNewCategory() ||
                    that.isModifyingNewCategory() ||
                    that.isAddingNewExpectation() ||
                    that.isModifyingNewExpectation() ||
                    that.isAddingNewExpectationForCategory() ||
                    that.isLoading() ||
                    that.isModifyingNewExpectationForCategory();
        });

        that.loadData = function () {
            that.loadRatings();
            that.loadProcessList();
        };

        that.loadProcessList = function () {
            dataservice.process.GetAllProcesses()
            .then(function (data) {
                that.processes(data);
                that.selectCurrentProcess();
            })
            .fail()
            .always();
        };

        that.loadProcesses = function () {
            dataservice.process.GetAllProcesses()
            .then(function (data) {
                that.processes(data);
            })
            .fail()
            .always();
        };

        that.selectCurrentProcess = function () {
            var currentProcess = _.find(that.processes(), function (item) {
                return item.Year == new Date().getFullYear();
            });

            if (currentProcess != null) {
                that.selectedProcessId(currentProcess.Id);
                that.loadProcess();
                that.lastProcessesVM.selectPreviousProcess(currentProcess.Year);
            }
        };

        that.loadRatings = function () {
            dataservice.rating.Get()
            .then(function (data) {
                that.ratings(data);
            })
            .fail()
            .always();
        };

        that.disableUsedNodes = function () {
            that.lastProcessesVM.disableUsedNodes();
        };

        that.loadProcess = function loadProcess() {
            //debugger;
            return $.Deferred(function (def) {
                that.shouldShowAdvice.off();
                that.isLoading.on();
                if (that.selectedProcessId() != null) {
                    dataservice.process.GetByProcessId(that.selectedProcessId())
                        .then(function (data) {
                            that.categories(data.Expectations);
                            that.process(data);
                            that.showAdvice();
                            that.resetRating();
                            that.disableUsedNodes();
                            def.resolve();
                        })
                        .fail(function () {
                            def.reject();
                        })
                        .always(that.isLoading.off());
                }
            }).promise();
        };

        that.showAdvice = function () {
            if (that.process().Expectations.length == 1) {
                that.shouldShowAdvice.on();
            } else {
                that.shouldShowAdvice.off();
            }
        };

        that.resetRating = function () {
            that.newCategory.selectedRatingValue(null);
        };

        window.currentCategoryVM = that;
        return that;
    }

    return {
        getVM: getVM
    };
});