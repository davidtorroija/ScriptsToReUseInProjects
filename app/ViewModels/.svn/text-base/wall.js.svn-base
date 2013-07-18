define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/masterData'],
function (ko, toastr, dataservice, utils, masterData) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.employeeSid = null;
        that.processes = ko.observableArray();
        that.selectedEmployees = ko.observableArray();
        that.bind = bind;
        that.isLoading = ko.observable(false).extend({ toggle: false });
        that.isLoadingWall = ko.observable(false).extend({ toggle: false });
        that.processId = null;
        that.expectations = ko.observableArray();
        that.manager = ko.observable();
        that.directReports = ko.observableArray();
        that.overalRisks = ko.observableArray();
        that.overalRatings = ko.observableArray();
        that.statuses = ko.observableArray();
        that.filteredDirectReports = ko.computed(function () {
            return _(that.directReports()).filter(function (item) {
                return (!that.selectedStatus() || (item.PerformanceReviewStatusIndicator && (item.PerformanceReviewStatusIndicator.Description).toUpperCase() === that.selectedStatus()))
                && (!that.selectedRating() || (item.OverallPerformanceRatingIndicator && item.OverallPerformanceRatingIndicator.Weight === that.selectedRating()))
                && (!that.selectedRisk() || (item.RiskRatingIndicator && item.RiskRatingIndicator.Weight === that.selectedRisk()));
            });
        });

        that.selectedStatus = ko.observable();
        that.selectedRating = ko.observable();
        that.selectedRisk = ko.observable();

        function bind(element) {
            ko.applyBindings(that, $(element).get(0));
            privates.loadData();
        }

        privates.loadProcesses = function () {
            return dataservice.process.GetAllProcesses()
                .then(function (data) {
                    that.processes(data);
                })
                .fail(utils.handleError)
                ;
        };

        privates.loadManager = function () {
            return dataservice.employee.GetBySid({ sid: that.employeeSid })
                .then(function (data) {
                    that.manager(data);
                })
                .fail(utils.handleError)
                ;
        };

        privates.extendDirectReports = function (item) {
            item.selected = ko.observable();
        };

        privates.loadDirectReports = function () {
            return dataservice.employee.GetWallDirectReportsBySid({ sid: that.employeeSid, processId: that.processId })
                .then(function (data) {
                    _(data).each(privates.extendDirectReports);
                    that.directReports(data);
                })
                .fail(utils.handleError);
            //.always(function () { that.isLoading(false); });
        };

        that.loadWall = function () {
            if (that.employeeSid) {
                that.isLoadingWall(true);
                return $.when(privates.loadManager(), privates.loadDirectReports())
                        .always(that.isLoadingWall.off);
            }
        };



        privates.loadFilters = function () {
            return $.when(dataservice.ratingOption.GetOverallRiksOptionsByProcess({ processId: that.processId })
                .then(function (data) {
                    that.overalRisks(_(data).sortBy(function (item) {
                        return item.Weight;
                    }));
                })
                .fail(utils.handleError),
            dataservice.ratingOption.GetOverallRatingOptionsByProcess({ processId: that.processId })
                .then(function (data) {
                    that.overalRatings(_(data).sortBy(function (item) {
                        return item.Weight;
                    }));
                })
                .fail(utils.handleError),
            dataservice.status.Get()
                .then(function (data) {
                    that.statuses(data);
                })
                .fail(utils.handleError));
        };

        privates.loadData = function () {
            that.isLoading(true);
            return $.when(that.loadWall(), privates.loadFilters(), privates.loadProcesses())
                    .always(that.isLoading.off);
            //            privates.loadFilters();
            //            privates.loadStatuses();
            //            return privates.loadProcesses()
            //                .always(that.isLoading.off)
            //                ;
        };

        that.canDrillUp = ko.computed(function () {
            return that.manager() && that.manager().ManagerSid;
        });

        that.drillDown = function (employee) {
            that.employeeSid = employee.Sid;
            that.loadWall();
        };

        that.drillUp = function (employee) {
            that.employeeSid = employee.ManagerSid;
            window.location = '#/bysid/' + employee.ManagerSid;
            //privates.loadWall();
        };

        that.managerImageUrl = ko.computed(function () {
            if (that.manager())
                return utils.mapEmployeeImage(that.manager());
            return null;
        });
        that.employeeImageUrl = function (employee) {
            return utils.mapBulkEmployeeImage(employee.EmployeeSpriteSids);
        };
        that.bulkPhotoOffset = function (employee) {
            return employee.EmployeeSpriteOffset * -63;
        };
        that.employeePerformanceUrl = function (employee) {
            return utils.mapPath('performanceassessment#/bysid/' + employee.Sid);
        };
        that.fullName = ko.computed(function () {
            if (that.manager())
                return that.manager().FullName;
            return null;
        });
        that.statusDescription = function (status) {
            if (status === null) {
                return 'NOT STARTED';
            }
            return status.Description;
        };
        that.isRiskPainted = function (employee, option) {
            return employee.RiskRatingIndicator && employee.RiskRatingIndicator.Weight >= option.Weight;
        };
        that.isRatingPainted = function (employee, option) {
            return employee.OverallPerformanceRatingIndicator && employee.OverallPerformanceRatingIndicator.Weight >= option.Weight;
        };

        window.paVM = that;
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