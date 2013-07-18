define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/expectation.assign'],
function (ko, toastr, dataservice, utils, assignBase) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = assignBase.getVM(spec, privates);

        that.rules = ko.observableArray([]);
        that.selectedRule = ko.observable();
        that.searchEmployeeValue = ko.observable();

        that.isSelected = function (item) {
            if (that.selectedRule()) {
                return that.selectedRule().Id === item.Id;
            }
            return false;
        };

        //        that.expectationsByRule = ko.observableArray([]);
        //        that.expectationsWithoutRule = ko.observableArray([]);
        that.selectedEmployee = ko.observable();
        that.filters = ko.observableArray();
        that.selectedRuleFilter = ko.observable();
        that.isAddingIsBelow = ko.observable(false).extend({ toggle: null });
        that.isAddingJobTitle = ko.observable(false).extend({ toggle: null });
        that.isAddingLob = ko.observable(false).extend({ toggle: null });
        that.isAddingNewRule = ko.observable(false).extend({ toggle: null });
        that.isAssigningExpectations = ko.observable(false).extend({ toggle: null });

        var filterObject = {
            ruleFilters: ko.observableArray([{ Id: 1, Description: 'IsBelow', Type: 'IsBelow', Error: 'Please select an employee in the \'Is Below\' filter' },
                { Id: 2, Description: 'BySid', Type: 'BySid', Error: 'Please select an employee in the \'By Sid\' filter' },
                { Id: 3, Description: 'Lob', Type: 'Lob', Error: '' },
                { Id: 3, Description: 'JobTitle', Type: 'JobTitle', Error: ''}]),
            selectedRuleFilter: ko.observable(),
            enabled: ko.observable(true),
            filterValue: ko.observable(),
            showAnd: false,
            isValid: false
        };

        that.subscribeSelectedRule = function (value) {
            if (value != null) {
                var lastFilter = that.filters()[that.filters().length - 1];

                if (true) {
                    lastFilter.enabled(false);

                    var newFilter = {
                        ruleFilters: ko.observableArray(lastFilter.ruleFilters().slice()),
                        selectedRuleFilter: ko.observable(),
                        enabled: ko.observable(true),
                        filterValue: ko.observable(),
                        showAnd: true,
                        isValid: false
                    };

                    newFilter.selectedRuleFilter.subscribe(function (value) {
                        that.subscribeSelectedRule(value);
                    });

                    var usedRuleFilter = _(newFilter.ruleFilters()).find(function (item) { return item.Type == lastFilter.selectedRuleFilter(); });
                    var ruleToDelete = null;

                    if (usedRuleFilter.Type == 'IsBelow') {
                        ruleToDelete = _(newFilter.ruleFilters()).find(function (item) { return item.Type == 'BySid'; });
                    } else if (usedRuleFilter.Type == 'BySid') {
                        ruleToDelete = _(newFilter.ruleFilters()).find(function (item) { return item.Type == 'IsBelow'; });
                    }

                    newFilter.ruleFilters.remove(usedRuleFilter);

                    if (ruleToDelete != null) {
                        newFilter.ruleFilters.remove(ruleToDelete);
                    }

                    that.filters.push(newFilter);
                }
            }
        };

        filterObject.selectedRuleFilter.subscribe(function (value) {
            that.subscribeSelectedRule(value);
        });

        that.searchEmployeeSelect = function (value, filterValue, filter, employee) {
            var values = employee ? employee.Sid : '';

            filter.isValid = employee ? true : false;
            value(employee.FullName);
            filter.filterValue(values);
        };

        that.deselectRule = function () {
            that.selectedRule(null);
            privates.expectationIds.removeAll();
        };

        that.selectedRuleDescription = ko.computed(function () {
            return that.selectedRule() ? that.selectedRule().Description : '';
        });

        that.newRule = {
            EmployeeId: null,
            Description: ko.observable(''),
            LOB: ko.observable(''),
            JobTitle: ko.observable(''),
            IsBelow: ko.observable()
        };

        that.selectRule = function (rule) {
            that.selectedRule(rule);

            dataservice.expectation.GetIdsByRuleId(
            {
                ruleId: that.selectedRule().Id,
                processId: that.processId
            })
            .then(function (data) {
                privates.expectationIds(data);
                //                that.expectationsByRule(data);
            });
        };

        var baseLoadData = that.loadData;
        that.loadData = function () {
            baseLoadData();

            dataservice.assignmentRule.Get()
            .then(function (data) {
                that.rules(data);
                that.initializeNewRule();
            });

            that.deselectRule();
        };

        that.initializeNewRule = function () {
            filterObject.selectedRuleFilter(null);
            filterObject.enabled(true);
            filterObject.filterValue('');
            filterObject.isValid = false;
            that.filters([filterObject]);
            that.newRule.Description('');
        };

        that.addNewRule = function () {
            that.isAddingNewRule.on();
            that.showNewGroup();
        };

        //todo poner nombre representativo
        function filter(child) { return child.isChecked(); }

        that.assign = function () {
            privates.showChooseExpectations();
        };

        that.expectationIsSelected = function (expectation) {
            return expectation.isChecked();
        };

        privates.assignExpectationsCallback = function (expectations) {
            dataservice.assignmentRule.AddExpectations(
            {
                ruleId: that.selectedRule().Id,
                expectationIds: _(expectations).pluck('Id')
            })
            .then(function (data) {
                privates.closeChooseExpectations();
                that.selectRule(that.selectedRule());
            })
            .fail()
            .always();
        };

        that.getError = function (filter) {
            return _(filter.ruleFilters()).find(function (rule) { return rule.Type == filter.selectedRuleFilter(); }).Error;
        };

        that.saveNewRule = function () {
            if (that.newRule.Description() != '' && that.filters().length > 1) {
                var newRule = ko.toJS(that.newRule);
                var error = false;

                _(that.filters()).each(function (filter) {
                    if (filter.selectedRuleFilter() == 'IsBelow') {
                        if (filter.isValid) {
                            newRule.IsBelow = true;
                            newRule.EmployeeSid = filter.filterValue();
                        } else {
                            toastr.error(that.getError(filter));
                            error = true;
                        }
                    } else if (filter.selectedRuleFilter() == 'BySid') {
                        if (filter.isValid) {
                            newRule.IsBelow = false;
                            newRule.EmployeeSid = filter.filterValue();
                        } else {
                            toastr.error(that.getError(filter));
                            error = true;
                        }
                    } else if (filter.selectedRuleFilter() == 'Lob') {
                        newRule.LOB = filter.filterValue();
                    } else if (filter.selectedRuleFilter() == 'JobTitle') {
                        newRule.JobTitle = filter.filterValue();
                    }
                });

                if (!error) {
                    dataservice.assignmentRule.AddItem(newRule)
                    .then(function (data) {
                        var foundRule = _(that.rules()).find(function (rule) { return rule.Id == data.Id; });

                        if (foundRule != null) {
                            toastr.info('The created rule already exists with the name ' + foundRule.Description);
                        } else {
                            that.rules.push(data);
                            toastr.success('Rule successfuly added');
                            that.closeNewGroup();
                            that.isAddingNewRule.off();
                        }

                        that.initializeNewRule();
                    });
                }
            }
            else {
                toastr.error('A group name and filter are needed');
            }
        };

        that.removeExpectation = function (expectation) {
            dataservice.expectation.DeleteRuleExpectation({
                expectationId: expectation.Id,
                ruleId: that.selectedRule().Id
            }).then(function (data) {
                that.selectRule(that.selectedRule());
            });
        };

        that.showNewGroup = function () {
            $('#newGroup').modal({ backdrop: 'static', keyboard: false });
        };

        that.closeNewRule = function () {
            that.initializeNewRule();
            that.closeNewGroup();
        };

        that.closeNewGroup = function () {
            $('#newGroup').modal('hide');
        };

        window.ratingVM = that;
        return that;
    }

    var vm;
    function getSingleton() {
        return vm || (vm = getVM());
    }
    return {
        getVM: getSingleton
    };
});