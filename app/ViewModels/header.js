define(['ko', 'toastr', 'dataservice', 'utils', 'literals'],
function (ko, toastr, dataservice, utils, literals) {
    function headerViewmodel() {

        function bind(element) {
            ko.applyBindings(that, $(element).get(0));
        }
        var employee = ko.observable();
        function loadData() {
            dataservice.employee.GetLoggedEmployee()
            .then(function success(data) {
                employee(data);
            });
        }

        var that = {
            bind: bind,
            loadData: loadData
        };

        that.searchCriteria = ko.observable('').extend({ required: true });
        that.openWallUrl = function (item) {
            //Sammy().stop();
            return utils.mapPath('wall#/bysid/' + item.Sid);
        };
        that.openReviewUrl = function (item) {
            return utils.mapPath('performanceassessment#/bysid/' + item.Sid);
        };
        that.searchEmployees = function (request, response) {
            dataservice.search.SearchEmployees({
                criteria: request.term,
                page: 1,
                pageSize: 10
            }).then(function (data) {
                _(data).each(function (item) {
                    item.openWallUrl = that.openWallUrl;
                    item.openReviewUrl = that.openReviewUrl;
                });
                response(data);
            }).fail(function (error) {
                $('#mainSearch').removeClass('isSearching');
                utils.handleError(error);
            });
        };
        that.searchEmployeeValue = ko.observable();
        that.searchEmployeeSelect = function (item) {
            //console.log('select', item);
            that.searchEmployeeValue(item.FullName);
        };
        that.fullname = ko.computed(function () {
            if (employee()) {
                return employee().FullName;
            };
            return null;
        });

        return that;
    }
    var vm;
    function getSingleton() {
        return vm || (vm = headerViewmodel());
    }
    return {
        getViewmodel: getSingleton
    };
});
