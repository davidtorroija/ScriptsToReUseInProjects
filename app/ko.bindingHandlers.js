define('ko.bindingHandlers',
['jquery', 'ko', 'utils'],
function ($, ko, utils) {
    var unwrap = ko.utils.unwrapObservable;


    ko.bindingHandlers.uploader = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

            var defaultConfig = {
                element: element,
                //action: utils.mapPath('Administration/'+element.classList[0]),
                uploadButtonText: 'Upload File',
                allowedExtensions: ['xlsx'],
                acceptFiles: '.xlsx'
            };
            $.extend(defaultConfig, ko.utils.unwrapObservable(valueAccessor()));
            //            if (location.pathname.toLowerCase().indexOf('administration/') === -1) {
            defaultConfig.action = utils.mapPath('Administration/' + defaultConfig.action);
            //            }
            //            

            uploader = new qq.FileUploader
                ({
                    element: element,
                    uploadButtonText: defaultConfig.uploadButtonText,
                    action: defaultConfig.action,
                    allowedExtensions: defaultConfig.allowedExtensions,
                    acceptFiles: defaultConfig.acceptFiles,
                    onComplete: defaultConfig.onComplete
                });
        }
    };

    ko.bindingHandlers.escape = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var command = valueAccessor();
            $(element).keyup(function (event) {
                if (event.keyCode === 27) { // <ESC>
                    command.call(viewModel, viewModel, event);
                }
            });
        }
    };
    ko.bindingHandlers.enter = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var command = valueAccessor();
            $(element).keyup(function (event) {
                var keyCode = (window.event) ? event.which : event.keyCode;
                if (keyCode === 13) { // <ENTER>
                    command.call(viewModel, viewModel, event);
                }
            });
        }
    };
    ko.bindingHandlers['htmleditor'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //note: no tested for multiple instances
            var defaultConfig = {};
            var enabledSetContent = true;
            defaultConfig.selector = "textarea";
            defaultConfig.menubar = false;
            defaultConfig.toolbar = "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent";
            defaultConfig.setup = function (ed) {
                ed.on('focusout', function () {
                    enabledSetContent = false;
                    defaultConfig.value(ed.getContent());
                    enabledSetContent = true;
                });
                ed.on('init', function () {
                    if (defaultConfig.value()) {
                        if (enabledSetContent) {
                            ed.setContent(defaultConfig.value());
                        }
                    }
                });
                if (ko.isSubscribable(defaultConfig.value)) {
                    defaultConfig.value.subscribe(function (content) {
                        if (enabledSetContent) {
                            ed.setContent(content);
                        }
                    });
                }
            };
            $.extend(defaultConfig, ko.utils.unwrapObservable(valueAccessor()));
            tinyMCE.init(defaultConfig);
        }
    };
    ko.bindingHandlers['tooltip'] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var config = ko.utils.unwrapObservable(valueAccessor());
            //console.log('config ', config);
            if (typeof config == 'string') {
                config = { title: config };
            } else {
                config = config || {};
            }

            config.closeDelay = config.closeDelay || 4000;
            config.placement = config.placement || 'bottom';
            config.trigger = config.trigger || 'click';
            $(element).tooltip(config).on('click', function (evnt) {
                setTimeout(function () { $(element).tooltip('hide'); }, config.closeDelay);
                evnt.stopImmediatePropagation();
                return false;
            });
        }
    };
    ko.bindingHandlers['setfocus'] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value) {
                $(element).focus();
            }
        }
    };
    ko.bindingHandlers['yesnotooltip'] = {
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).attr('title', value ? (allBindingsAccessor().yeslabel || 'yes') : (allBindingsAccessor().nolabel || 'no'));
        }
    };
    ko.bindingHandlers['yesnotext'] = {
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).text(value ? (allBindingsAccessor().yeslabel || 'yes') : (allBindingsAccessor().nolabel || 'no'));
        }
    };
    ko.bindingHandlers['datetext'] = {
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var bind = valueAccessor();
            if (ko.isSubscribable(bind) || (typeof (bind) !== 'object')) {
                bind = {};
                bind.value = ko.utils.unwrapObservable(valueAccessor());
            }
            var val = bind.value;
            if (typeof bind.value == 'function') {
                val = bind.value();
            }

            bind.nullText = bind.nullText || '';
            bind.format = bind.format || 'L';

            if (val) {
                //ko.bindingHandlers.text.update(element, moment(val, 'YYYY-MM-DDTHH:mm:ss').format(bind.format));
                $(element).text(moment(val, 'YYYY-MM-DDTHH:mm:ss').format(bind.format));
            } else {
                $(element).text(bind.nullText);
            }
        }
    };
    ko.bindingHandlers['inFieldLabel'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var inFieldConfig = ko.utils.unwrapObservable(valueAccessor());
            //console.log('inFieldLabel.init');
            //todo handle no id element
            $('<label for="' + element.id + '" class="' + inFieldConfig.cssClass + '">' + inFieldConfig.text + '</label>').insertBefore(element).inFieldLabels();
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $(element).prevAll('[for=' + element.id + ']').inFieldLabels();
        }
    };

    //approach 1: needs stop propagation on vm method that shows the element
    ko.bindingHandlers['outerClick2'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var config = valueAccessor();
            //console.log(config);
            $(document).click(function (evnt) {
                if (ko.utils.unwrapObservable(config.active)) {
                    if (element !== evnt.target && !$(element).find(evnt.target).length) {
                        //console.log('outer click');
                        ko.utils.unwrapObservable(config.method)(viewModel, evnt);
                    }
                }
            });
        }
    };
    //approach 2: needs stop propagation on vm method that shows the element

    ko.bindingHandlers['outerClick'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var config = valueAccessor();
            function documentClick(evnt) {
                if (element !== evnt.target && !$(element).find(evnt.target).length) {
                    //console.log('outer click');
                    //$(document).off('click', documentClick);
                    ko.utils.unwrapObservable(config.method)(viewModel, evnt);
                }
            }
            config.active.subscribe(function (value) {
                if (value) {
                    //console.log('registred');
                    $(document).on('click', documentClick);
                } else {
                    //console.log('registred off');
                    $(document).off('click', documentClick);
                }
            });
        }
    };

    ko.bindingHandlers['fitMultiline'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var minLine = valueAccessor() || 1;
            $(element).keyup(function () {
                this.rows = (this.value.split('\n').length || 1);
            });
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $(element).keyup();
        }
    };

    ko.bindingHandlers['autocompleteS'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //console.log('autocomplete');
            var config = ko.utils.unwrapObservable(valueAccessor());
            var template = config.template || { name: 'autocompleteItem' };
            if (typeof template === 'string')
                template = { name: template };

            var noDataFoundTemplate = config.noDataFoundTemplate || { name: 'autocompleteNoDataFound' };
            if (typeof noDataFoundTemplate === 'string')
                noDataFoundTemplate = { name: noDataFoundTemplate };

            var defaultConfig = {
                minLength: 3,
                delay: 6000000
            };
            config = $.extend(defaultConfig, config);
            for (property in config) {
                if (typeof config[property] === 'function' && property !== 'source') {
                    var wrappedFunction = config[property];
                    config[property] = function (evnt, ui) {
                        wrappedFunction(ui.item, evnt);
                        return false;
                    };
                }
            }

            function renderItemTemplate(ul, item) {
                if (item.noDataFound) {
                    var element = $("<li>").data("item.autocomplete", item);
                    ko.applyBindingsToNode(element.get(0), { template: noDataFoundTemplate }, item);
                    return element.appendTo(ul);
                } else {
                    var element = $("<li>").data("item.autocomplete", item);
                    ko.applyBindingsToNode(element.get(0), { template: template }, item);
                    return element.appendTo(ul);
                }
            }

            var elem = $(element);

            function search() {
                elem.autocomplete('search');
            }

            if (config.trigger) {
                //$(config.trigger).click(function () {
                elem.parent().find(config.trigger).click(function () {
                    elem.focus();
                    search();
                    return false;
                });
            }

            if (config.enterAllowed) {
                $(element).bind('keypress', function (e) {
                    if (e.keyCode == 13) {
                        //Enter key
                        search();
                    }
                    else if (e.keyCode == 46    //Delete key
                        || e.keyCode == 8       //Backspace key
                        || e.keyCode == 9       //tab key
                        || e.keyCode == 35      //Home key
                        || e.keyCode == 36      //End key
                        || e.keyCode == 37      //Left arrow key
                        || e.keyCode == 189     //Dash key
                        || e.keyCode == 110     //Decimal point key
                        || e.keyCode == 190     //Period key
                        || e.keyCode == 39) {   //Right arrow key
                        return true;
                    }
                    var regex = new RegExp("^[a-zA-Z0-9,.'ñÑ -]+$");
                    var key = String.fromCharCode(!e.keyCode ? e.which : e.keyCode);
                    if (!regex.test(key)) {
                        e.preventDefault();
                        return false;
                    }
                });
            }

            elem.focus(function () {
                $(element).parent().addClass('searchHelpTooltip');
                //console.log('tooltip');
            })

            elem.blur(function () {
                $(element).parent().removeClass('searchHelpTooltip');
                //console.log('tooltip');
            })

            elem.autocomplete({
                search: function (event, ui) {
                    $(element).parent().toggleClass('isSearching');
                    $(element).parent().removeClass('searchHelpTooltip');
                },
                response: function (event, ui) {
                    if (ui.content.length == 0) {
                        ui.content.push({ noDataFound: true });
                    }

                    $(element).parent().toggleClass('isSearching');
                }
            });
            elem.autocomplete(config).data("autocomplete")._renderItem = renderItemTemplate;



        }
    };

    ko.bindingHandlers['truncate'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor() || {});
            $(element).text(
                ko.utils.unwrapObservable(value['text']).length > parseInt(ko.utils.unwrapObservable(value['maxlength'])) - 3 ?
                    ko.utils.unwrapObservable(value['text']).substring(0, parseInt(ko.utils.unwrapObservable(value['maxlength'])) - 3) + '...' :
                    ko.utils.unwrapObservable(value['text'])
            );
        }
    };

    ko.bindingHandlers['collapsablePanel'] = {
        'init': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor() || {});
            var config = {
                startCollapsed: false
            };
            //console.log('startConfig before', config);
            $.extend(config, value);

            if (config.startCollapsed) {
                $(element).next().hide();
            }
            //add icon
            $(element).prepend('<span class="iconProperties iconS ui-icon-triangle-1-e"> </span>');

            $(element).click(function () {
                //console.log('this',$(this).next());
                //$(this).next().toggleClass('collapsed');
                $(element).find('span.iconProperties.iconS').toggleClass('ui-icon-triangle-1-e');
                $(element).find('span.iconProperties.iconS').toggleClass('ui-icon-triangle-1-s');
                $(this).next().slideToggle();                
            });
        }
    };

    ko.bindingHandlers['slidevisible'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = !(element.style.display == "none");
            if (value && !isCurrentlyVisible)
                $(element).slideDown(500);
            else if ((!value) && isCurrentlyVisible)
                $(element).slideUp(700);
        }
    }

    ko.bindingHandlers['fadevisible'] = {
        'update': function (element, valueAccessor) {
            //            console.log('fade');
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = !(element.style.display == "none");
            if (value && !isCurrentlyVisible)
                $(element).show(500);
            else if ((!value) && isCurrentlyVisible)
                $(element).hide(700);
        }
    }

    ko.bindingHandlers['animateloading'] = {
        'update': function (element, valueAccessor) {
            var animation = function () {
                $(element).find('img').fadeToggle();
            };
            var task;
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value) {
                $(element).show();
                task = setInterval(animation, 1500);
                $(element).data('task', task);
            } else {
                clearInterval($(element).data('task'));
                $(element).hide();
            }
        }
    }

    ko.bindingHandlers['slideleftvisible'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            //console.log('slideleftvisible', value, element);
            if (value) {//&& !isCurrentlyVisible) {
                $(element).css({ marginLeft: '100%' });
                $(element).animate({ marginLeft: '0' }, 'slow');
            }
        }
    }

    ko.bindingHandlers['stringformat'] = {
        'update': function (element, valueAccessor) {
            var config = ko.utils.unwrapObservable(valueAccessor());
            //todo: modify to support observables
            $(element).text(utils.format(config.format, config.params));
        }
    }

    ko.bindingHandlers.numeric = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            $(element).numeric(valueAccessor());
        }
    };
});