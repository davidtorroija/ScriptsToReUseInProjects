define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};
        that.isLoading = ko.observable(false).extend({ toggle: null });

        that.employeeSid = null;
        that.processId = 1;

        that.performance = ko.observable();
        that.expectations = ko.observable();
        that.ratings = ko.observableArray([]);
        that.employee = ko.computed(function () {
            if (that.performance())
                return that.performance().Employee;
            return null;
        });
        that.employeeImageUrl = ko.computed(function () {
            if (that.performance())
                return utils.mapEmployeeImage(that.performance().Employee);
            return null;
        });
        function bind(element) {
            ko.applyBindings(that, $(element).get(0));
            return that.loadData();
        }
        that.bind = bind;
        privates.expectationsOriginal = null;
        privates.loadPerformance = function () {
            return dataservice.performanceAssessment.GetBySid({ sid: that.employeeSid, processId: that.processId })
                .then(function (data) {
                    that.performance(data);
                })
                .fail(utils.handleError)
                ;
        };
        privates.loadExpectations = function () {
            //console.log('loadExpectations ', that.processId);
            return dataservice.expectation.GetBySid({ sid: that.employeeSid, processId: that.processId })
                .then(function (data) {
                    //that.expectations(null);
                    privates.expectationsOriginal = data;
                })
                .fail(utils.handleError)
                ;
        };

        function overallRatingAndRiskAssessment(item) {
            return item.Type === 'OverallRatingAndRiskAssessment';
        }
        privates.enableAutoSave = false;
        privates.prepareData = function prepareData() {
            console.log('privates.expectationsOriginal', privates.expectationsOriginal);
            var expectations = privates.expectationsOriginal;
            _(expectations).each(privates.extendExpectation);
            console.log('expectations', expectations, 'expectation obs', that.expectations());
            var risk = _(expectations).find(overallRatingAndRiskAssessment);
            if (risk) {
                risk.overallRating = _(risk.Children).findWhere({ Type: 'OverallRating' });
                risk.riskAssessment = _(risk.Children).findWhere({ Type: 'RiskAssessment' });
                risk.Children = _(risk.Children).reject(function (item) { return item.Type === 'OverallRating' || item.Type === 'RiskAssessment' })
            }
            that.risk(risk);
            that.expectations(_(expectations).reject(overallRatingAndRiskAssessment));
            privates.enableAutoSave = true;
            //console.log('expectation obs later', that.expectations());
        };

        privates.extendExpectation = function (expectation) {
            expectation.answer = privates.getAnswer(expectation.Id, that.performance().Id);
            _(expectation.Children).each(privates.extendExpectation);
        };
        privates.getAnswer = function (expectationId, performanceId) {
            var answer = privates.findAnswer(expectationId) || privates.createAnswer(expectationId, performanceId);
            //extend answer
            answer.RatingOptionId = ko.observable(answer.RatingOptionId);
            answer.RatingOptionComputed = ko.computed({
                read: function () {
                    return answer.RatingOptionId();
                },
                write: function (value) {
                    answer.RatingOptionId(value);
                    //console.log('write answer ', answer.RatingOptionId(), answer, 'answer');
                    if (privates.enableAutoSave) {
                        that.saveAnswer(answer);
                        //console.log('saveAnswer');
                    }
                }
            });
            answer.checkedRating = ko.observable();
            answer.ManagerComment = privates.extendComment(answer, answer.ManagerComment);
            answer.EmployeeComment = privates.extendComment(answer, answer.EmployeeComment);
            answer.HRComment = privates.extendComment(answer, answer.HRComment);
            //answer.Text = ko.observable(answer.Text); //so far not needed
            return answer;
        };
        privates.extendComment = function (answer, comment) {
            comment = comment || {};
            comment.Description = ko.observable(comment.Description);
            //answer.RatingOptionId = ko.observable(answer.RatingOptionId);
            //console.log(comment.Description(), comment, 'comment');
            comment.DescriptionComputed = ko.computed({
                read: function () {
                    return comment.Description();
                },
                write: function (value) {
                    comment.Description(value);
                    //console.log(comment.Description(), comment, 'comment', firstLoad, answer);
                    that.saveAnswer(answer);
                }
            });
            return comment;
        };
        privates.findAnswer = function (expectationId) {
            return _(that.performance().Answers).find(function (el) { return el.ExpectationId === expectationId; });
        };
        privates.createAnswer = function (expectationId, performanceId) {
            return {
                Id: null,
                ExpectationId: expectationId,
                PerformanceAssessmentId: performanceId,
                RatingOptionId: null,
                Text: null,
                ManagerComment: null,
                EmployeeComment: null,
                HRComment: null,
                ProcessId: that.performance().ProcessId,
                Sid: that.performance().Employee.Sid
            };
        };
        that.loadData = function loadData() {
            that.isLoading(true);
            return $.when(
                privates.loadExpectations(),
                privates.loadPerformance()
            )
                .done(privates.prepareData)
                .always(that.isLoading.off)
                ;
        };

        that.getOptions = function (answer) {
            return _.find(that.ratings(), function (rating) { return rating.Id === answer.RatingId; }).Options;
        };

        //will be private later
        that.createAnswer = function (answer) {
            return dataservice.answer.Add(ko.toJS(answer))
                .then(function (data) {
                    answer.Id = data.Id;
                    that.performance().Id = data.PerformanceAssessmentId;
                })
                ;
        };
        //will be private later
        that.updateAnswer = function (answer) {
            return dataservice.answer.Update(ko.toJS(answer));
        };
        //will be private later
        that.saveAnswer = function (answer) {
            answer.PerformanceAssessmentId = that.performance().Id;
            if (answer.Id) {
                return that.updateAnswer(answer);
            } else {
                return that.createAnswer(answer);
            }
        };

        that.goWall = function () {
            if (that.employee() && that.employee().ManagerSid) {
                location.href = utils.mapPath('wall#/bySid/' + that.employee().ManagerSid);
                return;
            }
            location.href = utils.mapPath('wall');
        };

        that.saveForm = function () {
        };

        that.cancelForm = function () {
        };

        window.paVM = that;
        that.risk = ko.observable();
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