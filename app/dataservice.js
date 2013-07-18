/*globals define,$,console, window*/
define('dataservice',
    ['jquery', 'amplify'],
    function ($, amplify) {
        var objetizeId = function (data) {
            if (typeof data === 'number' || typeof data === 'string') {
                return { id: data };
            }
            return data;
        };
        function performCall(controller, resourceId, data) {
            //console.log('dataservice (that): ', that);
            data = data || {};
            //data.id = data.id || '';
            //console.log('dataservice (data): ', data);
            return $.Deferred(function (def) {
                //console.log(that);
                //console.log('dataservice (action): ',action);
                data.controller = controller;
                amplify.request({
                    resourceId: resourceId,
                    data: data,
                    success: function (data) {
                        //console.log('success');
                        def.resolve(data);
                    },
                    error: function (err) {
                        def.reject(err);
                    }
                });
            }).promise();
        }
        function callAction(controller, action, resourceId, data) {
            data = data || {};
            data.action = action;
            return performCall(controller, resourceId, data);
        };

        function call(controller, resourceId, data) {
            data = data || {};
            data.id = data.id || '';
            return performCall(controller, resourceId, data);
        };

        function getRepository(spec, extensions) {
            spec = spec || {};
            var privates = {};

            var that = { controller: spec.controller || 'base' };

            if (typeof (spec) === 'string') {
                that.controller = spec;
                spec = {};
            }

            that.Add = function (data) {
                return call(that.controller, 'post', data);
            };

            that.Update = function (data) {
                return call(that.controller, 'put', data);
            };

            that.Get = function (data) {
                //console.log('dataservice (get) ',that.controller, that.resourceId,data,that.data);
                return call(that.controller, 'get', objetizeId(data));
            };

            that.Delete = function (data) {
                return call(that.controller, 'del', objetizeId(data));
            };

            that.CallAction = function (action, resourceId, data) {
                return callAction(that.controller, action, resourceId, data);
            };

            extensions = extensions || {};
            privates.extend = function (prop, action, resource) {
                //console.log(prop);
                that[prop] = function (data) {
                    //console.log(action, resource);
                    return callAction(that.controller, action, resource, objetizeId(data));
                };
            };
            for (ext in extensions) {
                privates.extend(ext, extensions[ext].action, extensions[ext].resource);
            }

            return that;
        }

        var employeeDs = getRepository('Employee', {
            GetLoggedEmployee: { action: 'GetLoggedEmployee', resource: 'getaction' },
            Get: { action: 'Get', resource: 'getaction' },
            GetBySid: { action: 'GetBySid', resource: 'getaction' },
            GetDirectReportsBySid: { action: 'GetDirectReportsBySid', resource: 'getaction' },
            GetWallDirectReportsBySid: { action: 'GetWallDirectReportsBySid', resource: 'getaction' }
        });

        var searchDS = getRepository('Search', {
            SearchEmployees: { action: 'SearchEmployees', resource: 'getaction' }
        });
        
        var expectationDS = getRepository('Expectation', {
            CanModifyExpectation: { action: 'GetCanModifyExpectation', resource: 'getaction' },
            Copy: { action: 'PostCopyItem', resource: 'postaction' },
            Add: { action: 'Post', resource: 'postaction' },
            Get: { action: 'Get', resource: 'getaction' },
            GetEnabledByProcessId: { action: 'GetEnabledByProcessId', resource: 'getaction' },
            GetByProcessId: { action: 'GetByProcessId', resource: 'getaction' },
            GetBySid: { action: 'GetByEmployeeSid', resource: 'getaction' },
            GetIdsBySid: { action: 'GetIdsByEmployeeSid', resource: 'getaction' },
            GetIdsBySids: { action: 'GetIdsByEmployeeSids', resource: 'getaction' },
            GetIdsByRuleId: { action: 'GetIdsByRuleId', resource: 'getaction' },
            GetWithoutRuleId: { action: 'GetWithoutRuleId', resource: 'getaction' },
            Update: { action: 'Put', resource: 'putaction' },
            Disable: { action: 'PutDisableItem', resource: 'putaction' },
            AssignEmployees: { action: 'PutAssignEmployees', resource: 'putaction' },
            AssignHierarchies: { action: 'PutAssignHierarchies', resource: 'putaction' },
            DeleteAssignEmployees: { action: 'DeleteAssignEmployees', resource: 'delaction' },
            DeleteRuleExpectation: { action: 'DeleteRuleExpectation', resource: 'delaction' },
            Delete: { action: 'Delete', resource: 'delaction' }
        });

        var processDS = getRepository('Process', {
            GetAllWithEnabledExpectations: { action: 'GetAllWithEnabledExpectations', resource: 'getaction' },
            GetAllProcesses: { action: 'GetAllProcesses', resource: 'getaction' },
            GetWithEnabledExpectations: { action: 'GetWithEnabledExpectations', resource: 'getaction' },
            GetByProcessId: { action: 'GetByProcessId', resource: 'getaction' },
            AddNewProcess: { action: 'PostAddNewProcess', resource: 'postaction' },
            Add: { action: 'Post', resource: 'postaction' },
            Get: { action: 'Get', resource: 'getaction' }
        });

        var performanceAssessmentDS = getRepository('PerformanceAssessment', {
            UpdateItem: { action: 'PutUpdateItem', resource: 'putaction' },
            Get: { action: 'Get', resource: 'getaction' },
            GetBySid: { action: 'GetByEmployeeSid', resource: 'getaction' }
        });

        var userDS = getRepository('User', {
            ChangeUser: { action: 'PutChangeUser', resource: 'putaction' },
            ActivateUser: { action: 'PutActivateUser', resource: 'putaction' },
            DeActivateUser: { action: 'PutDeActivateUser', resource: 'putaction' },
            Update: { action: 'PutUser', resource: 'putaction' },
            Add: { action: 'PostUser', resource: 'postaction' }
        });

        var answerDS = getRepository('Answer', {
            Update: { action: 'PutAnswer', resource: 'putaction' },
            Add: { action: 'PostAnswer', resource: 'postaction' }
        });

        var assignmentRuleDS = getRepository('AssignmentRule', {
            Add: { action: 'Post', resource: 'postaction' },
            AddItem: { action: 'PostAddItem', resource: 'postaction' },
            AddExpectations: { action:'PostExpectations', resource: 'postaction' }
        });

        var ratingOptionDS = getRepository('RatingOption', {
            GetOverallRiksOptionsByProcess: { action: 'GetOverallRiksOptionsByProcess', resource: 'getaction' },
            GetOverallRatingOptionsByProcess: { action: 'GetOverallRatingOptionsByProcess', resource: 'getaction' }
        });

        var ratingDS = getRepository('Rating', {
            CanModify: { action: 'GetCanModify', resource: 'getaction' },
            Disable: { action: 'PutDisable', resource: 'putaction' },
            Add: { action: 'Post', resource: 'postaction' },
            Get: { action: 'Get', resource: 'getaction' },
            Delete: { action: 'Delete', resource: 'delaction' }
        });

        var module = {
            process: processDS,
            expectation: expectationDS,
            appSettings: getRepository('AppSetting'),
            performanceAssessment: performanceAssessmentDS,
            rating: ratingDS,
            assignmentRule: assignmentRuleDS,
            ratingOption: ratingOptionDS,
            role: getRepository('Role'),
            search: searchDS,
            user: userDS,
            employee: employeeDs,
            answer: answerDS,
            status: getRepository('Status')
        };
        //window.dataserv = module;
        return module;
    });