define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};

        that.processes = ko.observableArray();
        that.selectedProcess = ko.observable(null);
        that.prevProcess = ko.observable(null);
        that.nextProcess = ko.observable(null);
        that.isLoading = ko.observable(false).extend({ toggle: false });
        that.shouldShowProcesses = ko.observable(false).extend({ toggle: false });
        privates.loadProcesses = function () {
            return dataservice.process.GetAllProcesses()
                .then(function (data) {
                    that.processes(data);
                })
                .fail(utils.handleError)
                ;
        };

        that.loadData = function () {
            that.isLoading(true);
            return privates.loadProcesses()
                .always(that.isLoading.off);
        };

        that.showCurrentYear = function (process) {
            //location = location.pathname + location.hash;
//            that.shouldShowProcesses.off();
//            that.selectedProcess(process);
        };

        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
            return that.loadData();
        };

        that.selectById = function (processId) {
            var index = _(that.processes()).indexOf(_(that.processes()).findWhere({ Id: parseInt(processId) }));
            that.prevProcess(that.processes()[index - 1] || {});
            that.nextProcess(that.processes()[index + 1] || {});
            that.selectedProcess(that.processes()[index]);
        };

        that.isSelected = function (item) {
            if (that.selectedProcess()) {
                return that.selectedProcess().Id === item.Id;
            }
            return false;
        };

        window.processVM = that;
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