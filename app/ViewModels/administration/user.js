define(['ko', 'toastr', 'dataservice', 'utils'],
function (ko, toastr, dataservice, utils) {
    function getVM(spec, privates) {
        privates = privates || {};
        spec = spec || {};
        var that = {};
        that.talentWallId = 0;
        privates.loadRoles = function () {
            return dataservice.role.Get()
                .then(function (data) {
                    that.roles(data);
                })
                .fail(utils.handleError);
        };

        that.isLoading = ko.observable(false);
        that.isNewUser = ko.observable(false).extend({ toggle: null });
        that.roles = ko.observableArray();
        that.targetUser = ko.observable(null);
        that.targetUser.subscribe(function (value) {
            if (value) {
                var role = _(that.roles()).find(function (el) { return el.Id == value.RoleId; });
                //console.log(role);
                if (role) {
                    //console.log('is a hard role');
                    that.selectedRoleId(role.Id);
                } else {
                    //console.log('is custom');
                    that.selectedRoleId(0);
                    privates.setRole(value.Role);
                }
            } else {
                that.selectedRoleId(null);
            }
        });
        that.selectedRoleId = ko.observable(null);
        that.roleVisible = ko.observable(false).extend({ toggle: null });
        that.selectedRoleId.subscribe(function (roleId) {
            //console.log(roleId);
            that.roleVisible(roleId !== undefined);
            if (roleId !== undefined) {
                var role = _(that.roles()).find(function (el) { return el.Id == roleId; });
                if (roleId === 0) {
                    that.editableRole(true);
                    if (that.targetUser()) {
                        privates.setRole(that.targetUser().Role);
                    } else {
                        for (key in that.roleConfig) {
                            that.roleConfig[key](false);
                        }
                    }
                } else {
                    if (role) {
                        that.editableRole(!role.ReadOnly);
                        privates.setRole(role);
                    }
                }
            }
        });
        privates.setRole = function (role) {
            if (role) {
                for (key in that.roleConfig) {
                    that.roleConfig[key](role[key]);
                }
            }
        };
        that.roleConfig = {
            ManageExpectation: ko.observable(false),
            ManageRating: ko.observable(false)
        };
        that.roleConfig.ManageExpectation.subscribe(function (flag) {
            if (flag) {
                that.roleConfig.ManageExpectation(true);
            }
        });
        that.roleConfig.ManageRating.subscribe(function (flag) {
            if (flag) {
                that.roleConfig.ManageRating(true);
            }
        });

        that.editableRole = ko.observable(false);
        that.bind = function (element) {
            ko.applyBindings(that, $(element).get(0));
            privates.loadRoles();
        };
        that.searchEmployees = function (request, response) {
            dataservice.search.SearchEmployees({
                criteria: request.term,
                page: 1,
                pageSize: 10
            }).then(function (data) {
                response(data);
            }).fail(utils.handleError);
        };

        that.searchEmployeeValue = ko.observable();
        that.searchEmployeeSid = ko.observable();

        that.searchEmployeeSelect = function (item) {
            that.searchEmployeeValue(item.FullName);
            that.searchEmployeeSid(item.Sid);
            that.isLoading(true);
            privates.loadUser(item.Sid)
                .fail(utils.handleError)
                .always(function () {
                    that.isLoading(false);
                });
        };

        that.loadData = function () {
            privates.loadRoles();
        };

        privates.loadUser = function (sid) {
            return dataservice.user.Get({
                sid: sid
            }).then(function (data) {
                that.isNewUser(data ? false : true);

                that.targetUser(data);
            }).fail(utils.handleError);
        };

        that.changeUser = function () {
            if (that.targetUser()) {
                dataservice.user.ChangeUser({
                    userId: that.targetUser().Id
                }).then(function (data) {
                    // console.log(data);
                    window.location = utils.mapPath('default');
                }).fail(utils.handleError);
            }
        };
        that.activateUser = function () {
            if (that.targetUser()) {
                dataservice.user.ActivateUser({
                    userId: that.targetUser().Id
                }).then(function (data) {
                    privates.loadUser(that.searchEmployeeSid())
                            .always(function () {
                                that.isLoading(false);
                            });
                }).fail(utils.handleError);
            }
        };
        that.deActivateUser = function () {
            if (that.targetUser()) {
                dataservice.user.DeActivateUser({
                    userId: that.targetUser().Id
                }).then(function (data) {
                    privates.loadUser(that.searchEmployeeSid())
                    .always(function () {
                        that.isLoading(false);
                    });
                }).fail(utils.handleError);
            }
        };
        that.cancel = function () {
            that.isNewUser(false);
            that.targetUser(null);
        };
        that.addUser = function () {
            if (that.roleVisible()) {
                if (!that.isLoading()) {
                    that.isLoading(true);
                    dataservice.user.Add({
                        sid: that.searchEmployeeSid(),
                        role: that.selectedRoleId(),
                        roleConfig: ko.toJS(that.roleConfig)
                    })
                        .then(function () {
                            toastr.success('User created successfully!');
                            privates.loadUser(that.searchEmployeeSid())
                            .always(function () {
                                that.isLoading(false);
                            });
                        })
                        .fail(function (error) {
                            that.isLoading(false);
                            utils.handleError(error);
                        });
                }
            } else {
                toastr.error('Select a role');
            }
        };
        privates.chooseWall = function (sid, callback) {
            dataservice.wall.GetBySidAll({ sid: sid })
                            .then(function (walls) {
                                if (walls.length > 1) {
                                    utils.chooseWall(walls, callback);
                                } else {
                                    callback(walls[0]);
                                }
                            })
                            ;
        };

        that.updateUser = function () {
            //console.log('add user');
            if (that.roleVisible()) {
                if (!that.isLoading()) {
                    that.isLoading(true);
                    dataservice.user.Update({
                        userId: that.targetUser().Id,
                        role: that.selectedRoleId(),
                        roleConfig: ko.toJS(that.roleConfig)
                    })
                        .then(function () {
                            toastr.success('User updated successfully!');
                            privates.loadUser(that.targetUser().SID)
                            .always(function () {
                                that.isLoading(false);
                            });
                        })
                        .fail(function (error) {
                            that.isLoading(false);
                            utils.handleError(error);
                        });
                }
            } else {
                toastr.error('Select a role');
            }
        };
        that.RemoveUserWall = function (userWall) {
            if (!that.isLoading()) {
                that.isLoading(true);
                dataservice.user.RemoveUserWall({ userWallId: userWall.Id })
                .then(function () {
                    toastr.success('User updated successfully!');
                    privates.loadUser(that.targetUser().SID)
                    .always(function () {
                        that.isLoading(false);
                    });
                })
                .fail(function (error) {
                    that.isLoading(false);
                    utils.handleError(error);
                });
            }
        };
        window.userVm = that;
        return that;
    }

    return {
        getVM: getVM
    };
});