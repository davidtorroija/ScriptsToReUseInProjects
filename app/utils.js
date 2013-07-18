define('utils',
['jquery', 'toastr', 'ko'],
function ($, toastr, ko) {
    function format(source, params) {
        if (arguments.length == 1)
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    }
    var that = {
        employeeImagesUrl: window.EPMC.constants.employeeImagesUrl,
        mapPath: function (path) {
            return window.EPMC.constants.appUrl + path;
        },
        mapEmployeeImage: function (employee) {
            employee = employee || {};
            return format(window.EPMC.constants.employeeImagesUrl, [employee.SID || employee.Sid || '', employee.Id || '']);
        },
        mapBulkEmployeeImage: function (sids) {
            return format(window.EPMC.constants.bulkEmployeeImagesUrl, [sids || '']);
        },
        handleError: function (error) {
            toastr.error(error.Errors || error.ExceptionMessage || error.Message || error);
        },
        format: format,
        isWallPage: function () {
            return (location.pathname).toLowerCase().indexOf("wall") >= 0;
        },
        profiling: {
            callMethodWithProfiling: function (method, parameters) {
                var initial = +new Date();
                var final;
                method.call(this, parameters);
                final = +new Date();
                //                console.log('Ellapsed Time of method "' + method.name + '"(milliseconds) =', final - initial);
            }
        },
        afterRenderIgnoreLoading: function (callback) {
            return function (elements) {
                if ($(elements).not('div#ignore').length) {
                    callback(elements);
                }
            };
        }

    };
    that.modalConfig = { cssSelector: '#myModal', cssSelectorBody: '#myModal .modal-body' };
    function ensureElement() {
        if (!$(that.modalConfig.cssSelector).length) {
            $('body').append('<div id="myModal" class="modal hide fade" >  <div class="modal-body">  </div></div>');
        }
    }
    that.modal = {
        open: function (param) {
            ensureElement();
            $(that.modalConfig.cssSelector).addClass('baseballCard');
            $(that.modalConfig.cssSelectorBody).html('<br/>');
            $(that.modalConfig.cssSelectorBody).load(param);
            $(that.modalConfig.cssSelector).modal();
        }
    };
    that.firstLetterToLowerCase = function firstLetterToLowerCase(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    };
    that.chooseWall = function (walls, callback) {
        //console.log('chooseWall');
        var applyBindings = !window.manyWall;
        var manyWall = window.manyWall = window.manyWall || {
            items: ko.observableArray([])
        };
        var group = _(walls).groupBy(function (el) { return el.Organization; });
        manyWall.items([]);
        manyWall.callback = callback;
        for (org in group) {
            manyWall.items.push({
                organization: org,
                items: group[org]
            });
        }
        manyWall.select = function (item) {
            //console.log('manyWall.select wall');
            manyWall.callback(item);
            $('#selectWall').modal('hide');
        };
        if (applyBindings) {
            ko.applyBindings(manyWall, $('#selectWall').get(0));
        }
        $('#selectWall').modal({ backdrop: 'static', keyboard: false });
    };
    that.post = function (path, params, method) {
        method = method || "post";
        var form = $(format("<form action='{0}' method='{1}' style='display:none;'>", [path, method]));
        for (var key in params) {
            form.append($(format("<input type='hidden' name='{0}' value='{1}'>", [key, params[key]])));
        }
        form.appendTo('body');
        form.submit();
        form.remove();
    };
    window.utilsTw = that;
    return that;
});