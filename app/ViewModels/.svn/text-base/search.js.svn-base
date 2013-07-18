define(['jquery', 'ko', 'toastr', 'dataservice', 'viewmodels/pager', 'utils', 'viewmodels/compareList', 'viewmodels/wall'],
function ($, ko, toastr, dataservice, pagervm, utils, compareList, wall) {

    function getVM(spec, privates) {
        privates = privates || {};

        privates.performSearch = function () {
            return dataservice.search.SearchWall({
                criteria: that.searchCriteria(),
                page: that.pager.currentPage(),
                pageSize: that.pager.pageSize
            })
                .then(function (data) {
                    that.results(data.Results);
                    that.pager.setPageCount(data.Pages);
                })
                .fail(utils.handleError)
                ;
        };


        var that = {};
        that.searchCriteria = ko.observable('').extend({ required: true });
        that.compare = compareList.getVM();
        that.results = ko.observableArray([]);
        that.pager = pagervm.createPager();
        that.bind = function (element) {
            return $.Deferred(function (def) {
                ko.applyBindings(that, $(element).get(0));
                //console.log('search.bind');
                that.pager.onPageIndexChanged(function () {
                    that.search.execute();
                });
                def.resolve();
            }).promise();
        };
        that.openWall = function (item) {
            console.log(location);
            var vm = wall.getVM();
            if (utils.isWallPage()) {
                vm.openWallBySid(item.SID);
            } else {
                vm.getWallsBySid(item.SID, function (item) {
                    location.href = utils.mapPath('Wall/index/' + item.WallId);
                });
            }
        };

        that.openBaseballCard = function (item, evnt) {
            //console.log('open bbc');
            utils.modal.open(utils.mapPath(item.Url));
        };
        that.openFAQ = function (item, evnt) {
            //console.log('open bbc');
            utils.modal.open('Default/FAQs');
        };

        that.search = ko.asyncCommand({
            execute: function (complete) {
                privates.performSearch()
                    .always(function () {
                        complete();
                    });

            }
            ,
            canExecute: function (isExecuting) {
                //return false;
                return that.searchCriteria.isValid();
            }
        });
        that.clearSearch = function () {
            that.searchCriteria('');
        };
        that.resetAndSearch = function () {
            that.pager.reset();
            that.search.execute();
        };
        that.isRegularGroup = function (ix) {
            //console.log(ix());
            return ix() % 2 === 0;
        };
        that.isAlternativeGroup = function (ix) {
            //console.log(ix());
            return ix() % 2 !== 0;
        };
        that.isOneResult = function () {
            return that.results().length < 2;
        };
        that.searchEmployees = function (request, response) {
            //console.log(request.term);
            //that.searchHelpTooltip(false);
            dataservice.search.SearchEmployees({
                criteria: request.term,
                page: 1,
                pageSize: 10
            }).then(function (data) {
                data = _(data).map(function (el) {
                    return $.extend(el, { employeePhoto: utils.mapEmployeeImage(el),
                        openBaseballCard: function (item, evnt) {
                            utils.modal.open(utils.mapPath('BaseballCard/bysid?sid=') + item.SID);
                        },
                        openWall: that.openWall,
                        isInCompareMode: that.compare.isInCompareMode,
                        isSidInComparissonList: that.compare.isSidInComparissonList,
                        addToCompare: that.addToCompare
                    });
                });
                response(data);
            }).fail(function (error) {
                $('#mainSearch').removeClass('isSearching');
                utils.handleError(error);
            })
        };

        that.searchCriteria.subscribe(function () {
            that.results.removeAll();
            that.pager.reset();
            //that.resetAndSearch();
        });

        ko.computed(function () {
            that.searchCriteria(); //set dependency
            //that.resetAndSearch(); //if the search is performed here executes several times, use subscribe instead
        }, this)
            .extend({ throttle: 1000 })
            .subscribe(function () {
                if (that.searchCriteria().length > 3)
                    that.resetAndSearch();
            });

        //autocomplete
        that.searchEmployeeValue = ko.observable();
        //        that.searchEmployeeValue.subscribe(function () {
        //            that.searchHelpTooltip(that.searchEmployeeValue() != '');
        //        });
        //        that.searchInputFocus = function () {
        //            if (!that.searchEmployeeValue())
        //                that.searchHelpTooltip(true);
        //        }
        //that.searchHelpTooltip = ko.observable(false);
        //that.searchEmployeeFocus = function (item) {
        //that.searchEmployeeValue(item.FullName);
        //that.searchHelpTooltip(true);
        //};
        that.searchEmployeeSelect = function (item) {
            //console.log('select', item);
            that.searchEmployeeValue(item.FullName);

        };
        that.viewWall = function (item) {
            console.log('view wall', item);
        };

        //        that.openBaseballCard = function (item, evnt) {
        //            console.log(evnt.currentTarget);
        //            utils.modal.open(utils.mapPath('BaseballCard/indexcontent/') + evnt.currentTarget.id);
        //        };
        that.addToCompare = function (item, evnt) {
            if (evnt.target.checked) {
                return that.compare.addSidToCompare(item.SID);
            } else {
                return that.compare.removeSidFromCompare(item.SID);
            }
        };
        return that;
    }

    function getVMFull(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = getVM(spec, privates);
        //        privates.selectedVM = null;
        //        privates.selectVM = function (vm) {
        //            if (privates.selectedVM)
        //                privates.selectedVM.isVisible(false);
        //            privates.selectedVM = vm;
        //            privates.selectedVM.isVisible(true);
        //        };
        that.recentWalls = ko.observableArray([]);
        that.recentProfiles = ko.observableArray([]);
        //my Organization
        privates.sidebarVM = null;
        var loadMyOrganization = function (viewmodel, evnt) {
            var el = viewmodel;
            //console.log('loadMyOrganization', el);
            if ($(el).length) {
                if (!privates.sidebarVM) {
                    require(['viewmodels/sidebar'], function (sidebar) {
                        var vm = sidebar.getVM({ parent: that });
                        //extend
                        vm.isVisible = ko.observable(true);
                        //ko.applyBindings(vm, $(el).get(0));
                        privates.sidebarVM = vm;
                        window.organization = vm;
                        vm.loadAll().then(function () {
                            //console.log(vm);
                            that.recentWalls(vm.recentWalls());
                            that.recentProfiles(vm.recentProfiles());
                        });


                        //privates.selectVM(vm);

                    });
                } else {
                    privates.sidebarVM.loadAll();
                    //privates.selectVM(privates.sidebarVM);
                }
            }
        };
        that.loadMyOrganization = loadMyOrganization;


        that.isShowingRecentProfiles = ko.observable(false);
        that.showRecentProfiles = function () {
            //            var result = !that.isShowingRecentProfiles();
            //            console.log(result);
            that.isShowingRecentProfiles(!that.isShowingRecentProfiles());
        };
        that.isShowingRecentWalls = ko.observable(false);
        that.showRecentWalls = function () {
            that.isShowingRecentWalls(!that.isShowingRecentWalls());
        };

        window.search = that;
        return that;
    }

    return {
        getVM: getVM,
        getVMFull: getVMFull
    };
});
//      that.loadSettings = loadSettings;
//my Profile
//        privates.helpVM = null;
//        var loadHelp = function (viewmodel, evnt) {
//            $('.active').removeClass('active');
//            var el = $(evnt.currentTarget).parent().addClass('active').attr('target');
//            console.log('loadHelp', el);
//            if ($(el).length) {
//                if (!privates.helpVM) {
//                    //require(['viewmodels/bbcsections/languages'], function (languages) {
//                    var vm = {};
//                    //extend
//                    vm.isVisible = ko.observable(true);
//                    //vm.employeeId = that.EmployeeId;
//                    ko.applyBindingsToNode($(el).get(0), { template: { name: 'help' }, visible: vm.isVisible }, vm);
//                    privates.helpVM = vm;
//                    //window.languages = vm;
//                    //vm.loadData();
//                    privates.selectVM(vm);
//                    //});
//                } else {
//                    //privates.helpVM.loadData();
//                    privates.selectVM(privates.helpVM);
//                }
//            }
//        };
//        that.loadHelp = loadHelp;

//        //Planning
//        privates.planningVM = null;
//        var loadPlanning = function (viewmodel, evnt) {
//            $('.active').removeClass('active');
//            var el = $(evnt.currentTarget).parent().addClass('active').attr('target');
//            console.log('loadPlanning', el);
//            if ($(el).length) {
//                if (!privates.planningVM) {
//                    //require(['viewmodels/bbcsections/languages'], function (languages) {
//                    var vm = {};
//                    //extend
//                    vm.isVisible = ko.observable(true);
//                    //vm.employeeId = that.EmployeeId;
//                    ko.applyBindingsToNode($(el).get(0), { template: { name: 'planning' }, visible: vm.isVisible }, vm);
//                    privates.planningVM = vm;
//                    //window.languages = vm;
//                    //vm.loadData();
//                    privates.selectVM(vm);
//                    //});
//                } else {
//                    //privates.planningVM.loadData();
//                    privates.selectVM(privates.planningVM);
//                }
//            }
//        };
//        that.loadPlanning = loadPlanning;

//        //Regions
//        privates.regionsVM = null;
//        var loadRegions = function (viewmodel, evnt) {
//            $('.active').removeClass('active');
//            var el = $(evnt.currentTarget).parent().addClass('active').attr('target');
//            console.log('loadRegions', el);
//            if ($(el).length) {
//                if (!privates.regionsVM) {
//                    //require(['viewmodels/bbcsections/languages'], function (languages) {
//                    var vm = {};
//                    //extend
//                    vm.isVisible = ko.observable(true);
//                    //vm.employeeId = that.EmployeeId;
//                    ko.applyBindingsToNode($(el).get(0), { template: { name: 'regions' }, visible: vm.isVisible }, vm);
//                    privates.regionsVM = vm;
//                    //window.languages = vm;
//                    //vm.loadData();
//                    privates.selectVM(vm);
//                    //});
//                } else {
//                    //privates.regionsVM.loadData();
//                    privates.selectVM(privates.regionsVM);
//                }
//            }
//        };
//        that.loadRegions = loadRegions;

//        //Notifications
//        privates.notificationsVM = null;
//        var loadNotifications = function (viewmodel, evnt) {
//            $('.active').removeClass('active');
//            var el = $(evnt.currentTarget).parent().addClass('active').attr('target');
//            console.log('loadPlanning', el);
//            if ($(el).length) {
//                if (!privates.notificationsVM) {
//                    //require(['viewmodels/bbcsections/languages'], function (languages) {
//                    var vm = {};
//                    //extend
//                    vm.isVisible = ko.observable(true);
//                    //vm.employeeId = that.EmployeeId;
//                    ko.applyBindingsToNode($(el).get(0), { template: { name: 'notifications' }, visible: vm.isVisible }, vm);
//                    privates.notificationsVM = vm;
//                    //window.languages = vm;
//                    //vm.loadData();
//                    privates.selectVM(vm);
//                    //});
//                } else {
//                    //privates.notificationsVM.loadData();
//                    privates.selectVM(privates.notificationsVM);
//                }
//            }
//        };
//        that.loadNotifications = loadNotifications;

//        //settings
//        privates.settingsVM = null;
//        var loadSettings = function (viewmodel, evnt) {
//            $('.active').removeClass('active');
//            var el = $(evnt.currentTarget).parent().addClass('active').attr('target');
//            console.log('loadSettings', el);
//            if ($(el).length) {
//                if (!privates.settingsVM) {
//                    //require(['viewmodels/bbcsections/languages'], function (languages) {
//                    var vm = {};
//                    //extend
//                    vm.isVisible = ko.observable(true);
//                    //vm.employeeId = that.EmployeeId;
//                    ko.applyBindingsToNode($(el).get(0), { template: { name: 'settings' }, visible: vm.isVisible }, vm);
//                    privates.settingsVM = vm;
//                    //window.languages = vm;
//                    //vm.loadData();
//                    privates.selectVM(vm);
//                    //});
//                } else {
//                    //privates.settingsVM.loadData();
//                    privates.selectVM(privates.settingsVM);
//                }
//            }
//        };