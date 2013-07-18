define(['ko', 'toastr', 'dataservice', 'utils', 'viewModels/administration/expectation.assign'],
function (ko, toastr, dataservice, utils, assignBase) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = assignBase.getVM(spec, privates);

        that.employeeSid = null;
        that.walls = ko.observableArray();
        that.employees = ko.observableArray();
        that.searchEmployeeValue = ko.observable();
        privates.callServerOnSelect = true;
        privates.createWall = function (manager, directReports, canClose) {
            var wall = {
                manager: manager || ko.observable(),
                directReports: ko.observableArray(directReports),
                filterVisible: ko.observable(false).extend({ toggle: null }),
                canClose: canClose || true,
                myDirects: ko.observable(false),
                filter: {
                    lobs: ko.observableArray([{ Description: 'Lob1'}]),
                    selectedLob: ko.observable(),
                    subLobs: ko.observableArray([{ Description: 'SubLob1'}]),
                    selectedSubLob: ko.observable(),
                    jobTitle: ko.observable(''),
                    directReportsFilteredByJobTitle: ko.observableArray()
                }
            };

            wall.filteredDirectReports = ko.computed(function () {
                return wall.filter.directReportsFilteredByJobTitle();
            });

            wall.directReports.subscribe(function () {
                wall.filter.directReportsFilteredByJobTitle(wall.directReports());
            });

            wall.filter.jobTitle.subscribe(function (value) {
                if (value != null && value != '') {
                    wall.filter.directReportsFilteredByJobTitle(_(wall.directReports()).filter(function (directReport) { return directReport.Position.indexOf(value) != -1; }))
                }
                else {
                    wall.filter.directReportsFilteredByJobTitle(wall.directReports());
                }
            });

            wall.myDirects.subscribe(function (value) {
                privates.callServerOnSelect = false;
                _(wall.directReports()).each(function (emp) { emp.selected(value); });
                privates.callServerOnSelect = true;
                if (value) {
                    privates.refreshIds(_(wall.directReports()).pluck('Sid'));
                }
            });

            return wall;
        };
        that.myWall = privates.createWall();
        that.myWall.canClose = false;

        that.selectedEmployees = ko.computed(function () {
            return _(that.employees()).filter(privates.filterSelected);
        });
        that.removeEmployee = function (employee) {
            employee.selected(false);
        };
        that.selectEmployee = function (employee, value) {
            //console.log('selectEmployee', arguments);
            if (value) {
                if (privates.callServerOnSelect) {
                    that.isLoading(true);
                    dataservice.expectation.GetIdsBySid({ sid: employee.Sid, processId: that.processId })
                        .then(function (ids) {
                            delete employee.expectationIds;
                            employee.expectationIds = ids;
                            privates.expectationArrayIds.push(ids);
                        })
                        .fail(utils.handleError)
                        .always(that.isLoading.off)
                        ;
                }
            } else {
                privates.expectationArrayIds.remove(employee.expectationIds);
            }
        };

        privates.loadManager = function (managerSid) {
            return dataservice.employee.GetBySid({ sid: managerSid })
                .then(function (data) {
                    that.myWall.manager(data);
                })
                .fail(utils.handleError)
                ;
        };

        privates.extendDirectReports = function (item) {
            privates.extendSelectable(item);
            item.selected.subscribe(_(that.selectEmployee).bind(null, item));
        };
        that.isLoadingDirectReports = ko.observable(false).extend({ toggle: null });
        privates.loadDirectReports = function (managerSid, callback) {
            that.isLoadingDirectReports(true);
            return dataservice.employee.GetDirectReportsBySid({ sid: managerSid })
                .then(function (data) {
                    _(data).each(privates.extendDirectReports);
                    that.employees(that.employees().concat(data));
                    if (callback) {
                        callback(data);
                        $('.sidebar').scrollTo('.sidebar > ul:last', 1000, { over: 12 });
                    } else {
                        that.myWall.directReports(data);
                    }
                })
                .fail(utils.handleError)
                .always(that.isLoadingDirectReports.off)
                ;
        };

        privates.loadWall = function (managerSid) {
            if (managerSid) {
                privates.loadManager(managerSid);
                privates.loadDirectReports(managerSid);
            }
        };

        var baseLoadData = that.loadData;
        that.loadData = function () {
            baseLoadData();
            that.employees.removeAll();
            privates.expectationArrayIds.removeAll();
            privates.expectationIds.removeAll();
            privates.loadWall(that.employeeSid);
        };

        privates.assign = function (api, params) {
            that.isLoading(true);
            return api(params)
                .then(function () {
                    toastr.success('Assigned successfully');
                })
                .fail(utils.handleError)
                .always(that.isLoading.off)
                ;
        };

        privates.getSelectedEmployees = function () {
            return _(that.selectedEmployees())
                .pluck('Sid')
                ;
        };

        privates.loadWallBox = function (manager, directReports) {
            //console.log('manager ', manager);
            //console.log('directReports ', directReports);
            that.walls.push(privates.createWall(manager, directReports));
        };
        that.closeWallBox = function (item) {
            console.log('closeWallBox', item);
            that.walls.remove(item);
            var employees = that.employees();
            _(item.directReports).each(function (el) {
                privates.expectationArrayIds.remove(el.expectationIds);
                ko.utils.arrayRemoveItem(employees, el);
            });
            that.employees.valueHasMutated();
        };
        that.searchEmployeeSelect = function (item) {
            that.searchEmployeeValue(item.FullName);
            privates.loadDirectReports(item.Sid, _(privates.loadWallBox).bind(null, item));
        };
        privates.refreshIds_old = function () {
            var arrayIds = privates.expectationArrayIds();
            _(that.selectedEmployees()).each(function (employee) {
                dataservice.expectation.GetIdsBySid({ sid: employee.Sid, processId: that.processId })
                        .then(function (ids) {
                            ko.utils.arrayRemoveItem(arrayIds, employee.expectationIds);
                            delete employee.expectationIds;
                            employee.expectationIds = ids;
                            arrayIds.push(ids);
                            privates.expectationArrayIds.valueHasMutated();
                        })
                        .fail(utils.handleError)
                            ;
            });
            privates.expectationArrayIds.valueHasMutated();
            privates.cleanSelectedExpectations();
            privates.closeChooseExpectations();
        };
        privates.refreshIds = function (sids) {
            if (!_(sids || privates.getSelectedEmployees()).any()) {
                return;
            }
            that.isLoading(true);
            privates.cleanSelectedExpectations();
            privates.closeChooseExpectations();
            var arrayIds = privates.expectationArrayIds();
            dataservice.expectation.GetIdsBySids({
                processId: that.processId,
                sids: (sids || privates.getSelectedEmployees()).join(',')
            })
                .then(function (ids) {
                    _(ids).each(function (id) {
                        var employee = _(that.employees()).findWhere({ Sid: id.Sid });
                        ko.utils.arrayRemoveItem(arrayIds, employee.expectationIds);
                        delete employee.expectationIds;
                        employee.expectationIds = id.ExpectationIds;
                        arrayIds.push(id.ExpectationIds);
                    });
                    privates.expectationArrayIds.valueHasMutated();
                })
                .fail(utils.handleError)
                .always(that.isLoading.off)
                ;
        };
        that.refreshIds = privates.refreshIds;
        privates.assignExpectationsToEmployees = function (expectations) {
            console.log('assignExpectationsToEmployees', expectations, privates.getSelectedEmployees());
            privates.assign(dataservice.expectation.AssignEmployees, {
                expectations: _(expectations).pluck('Id'),
                employees: privates.getSelectedEmployees()
            })
                .then(function () {
                    toastr.success('Expectations assigned successfully');
                    privates.refreshIds();
                });
        };
        privates.assignExpectationsToHierarchies = function (expectations) {
            console.log('assignExpectationsToHierarchies', expectations, privates.getSelectedEmployees());
            privates.assign(dataservice.expectation.AssignHierarchies, {
                expectations: _(expectations).pluck('Id'),
                hierarchies: privates.getSelectedEmployees()
            })
                .then(function () {
                    toastr.success('Expectations assigned successfully');
                    privates.refreshIds();
                });
        };
        that.showAssign = function () {
            console.log('showAssign');
            privates.assignExpectationsCallback = privates.assignExpectationsToEmployees;
            privates.showChooseExpectations();
        };
        that.showAssignHierarchies = function () {
            console.log('showAssignHierarchies');
            privates.assignExpectationsCallback = privates.assignExpectationsToHierarchies;
            privates.showChooseExpectations();
        };
        privates.getExpectations = function (expectation) {
            var ids = _(expectation.Children).chain().filter(that.isExpectationVisible).pluck('Id').value();
            ids.push(expectation.Id);
            return ids;
        };
        that.removeExpectation = function (expectation, event) {
            dataservice.expectation.DeleteAssignEmployees({
                expectations: privates.getExpectations(expectation),
                employees: privates.getSelectedEmployees()
            })
                .then(function () {
                    toastr.success('Expectation removed successfully');
                    privates.refreshIds();
                })
            ;
        };
        window.assVM = that;
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