define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function selectChildren(children, value) {
        _(children).each(function (item) {            
            item.selected(value);
        });
    }
    function extendSelectable(item) {
        item.selected = ko.observable();
    }
    function extendExpectation(item) {
        extendSelectable(item);
        if (_(item.Children).any()) {
            item.subscription = item.selected.subscribe(_(selectChildren).bind(null, item.Children));
            item.selected.on = function (value) {
                if (value) {
                    item.selected(true);
                }
            };
            _(item.Children).each(function (child) {
                extendExpectation(child);
                if (item) {
                    item.selected.subscribe(item.selected.on);
                }
                extendExpectationChild(item, child)
            });
        }
    };
    function extendExpectationChild(parent, child) {
        child.selected.subscribe(function (value) {
            //console.log('child', value, 'parent', parent.selected());
            if (value && !parent.selected()) {
                parent.subscription.dispose();
                parent.selected(value);
                parent.subscription = parent.selected.subscribe(_(selectChildren).bind(null, parent.Children));              
            }
        });
    };
    function extendExpectationChild1(parent, item) {
        extendExpectation(item);
        if (parent) {
            item.selected.subscribe(parent.selected.on);
        }
    };
    function filterSelected(item) { return item.selected(); }
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.processId = null;
        that.isLoading = ko.observable(false).extend({ toggle: false });
        that.expectations = ko.observableArray();
        that.risk = ko.observable();
        that.overallRating = ko.observable();
        that.riskAssessment = ko.observable();
        that.riskChildren = ko.computed(function () {
            if (that.risk()) {
                return _(that.risk().Children).where({ IsDefaultExpectation: false });
            }
        });
        that.dynamicExpectations = ko.computed(function () {
            return _(that.expectations()).where({ IsDefaultExpectation: false });
        });
        privates.expectationArrayIds = ko.observableArray();
        privates.expectationIds = ko.observableArray();
        that.expectationIds = privates.expectationIds;
        privates.expectationArrayIds.subscribe(function (value) {
            privates.expectationIds(_.intersection.apply(null, value));
        });

        privates.loadExpectations = function (processId) {
            that.isLoading(true);
            return dataservice.expectation.GetEnabledByProcessId({ processId: processId })
                .then(function (data) {
                    _(data).each(privates.extendExpectation);
                    that.expectations(data);
                    that.risk(_(data).findWhere({ Type: 'OverallRatingAndRiskAssessment' }));
                    that.overallRating(_(data.Children).findWhere({ Type: 'OverallRating' }));
                    that.riskAssessment(_(data.Children).findWhere({ Type: 'RiskAssessment' }));
                })
                .fail(utils.handleError)
                .always(that.isLoading.off);
        };

        privates.extendSelectable = extendSelectable;
        privates.extendExpectation = extendExpectation;
        privates.filterSelected = filterSelected;
        that.loadData = function () {
            if (that.processId) {
                that.isLoading(true);
                privates.loadExpectations(that.processId)
                    .always(that.isLoading.off)
                    ;
            }
        };

        that.searchEmployees = function (request, response) {
            dataservice.search.SearchEmployees({
                criteria: request.term,
                page: 1,
                pageSize: 10
            })
                .then(function (data) {
                    response(data);
                })
                .fail(utils.handleError)
                ;
        };
        that.isExpectationVisible = function (item) {
            if (item) {
                return privates.expectationIds.indexOf(item.Id) >= 0;
            }
            return false;
        };
        that.removeExpectation = function (expectation) {
            console.log('Call remove expectation: ', expectation, privates.getSelectedEmployees());
        };
        privates.showChooseExpectations = function () {
            $('#selectExpectations').modal({ backdrop: 'static', keyboard: false });
        };
        privates.closeChooseExpectations = function () {
            $('#selectExpectations').modal('hide');
        };
        privates.assignExpectationsCallback = null;
        that.assignExpectations = function () {
            privates.assignExpectationsCallback(privates.getSelectedExpectations(that.expectations()));
        };
        that.cancelAssignExpectations = function () {
            privates.cleanSelectedExpectations();
            privates.closeChooseExpectations();
        };
        privates.getSelectedExpectation = function (expectation) {
            var list = _(expectation.Children).filter(privates.filterSelected);
            if (expectation.selected())
                list.splice(0, 0, expectation);
            return list;
        };
        privates.getSelectedExpectations = function (expectations) {
            return Array.concat.apply(null, _(expectations).map(privates.getSelectedExpectation));
        };
        privates.cleanSelectedExpectation = function (item) {
            item.selected(false);
            _(item.Children).each(privates.cleanSelectedExpectation);
        };
        privates.cleanSelectedExpectations = function () {
            _(that.expectations()).each(privates.cleanSelectedExpectation);
        };
        window.assVM = that;
        return that;
    }

    return {
        getVM: getVM
    };
});