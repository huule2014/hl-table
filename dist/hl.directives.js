/**
 * Created by Win 8.1 Version 2 on 19/05/2016.
 */
(function () {
    'use strict';
    var appPath = null, templatePath = null;

    angular.module('hlTableModule', [])
        .provider('hlTableConfig', function () {
            return {
                getAppPath: function () {
                    return appPath;
                },
                setTemplatePath: function (value) {
                    if (angular.isDefined(value)) {
                        templatePath = value;
                    } else {
                        $log.error('No path to set template path.');
                    }
                },
                $get: function () {
                    return {
                        appPath: appPath,
                        templatePath: templatePath
                    }
                }
            }
        })
        // URL helper for all directives
        .factory('hlUrlHelper', function ($browser, $log) {
            return {
                baseUrl: function (custom) {
                    if (angular.isDefined(custom) && custom) {
                        return $browser.baseHref() + custom;
                    } else {
                        return $browser.baseHref();
                    }
                },
                templatePath: function () {
                    return templatePath;
                }
            }
        })
        .factory('hlElementHelper', function ($timeout, $log) {

            function makeID(length) {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                if (angular.isUndefined(length) || length < 0) {
                    length = 28;
                }

                for (var i = 0; i < length; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }

            return {
                generateID: function (tableName) {
                    if (angular.isDefined(tableName)) {
                        return 'hl-table-' + tableName;
                    } else {
                        return 'hl-table-' + makeID();
                    }
                }
            }
        })
        .factory('hlDataHelper', function ($rootScope, $q, $timeout, $http, $log, hlElementHelper) {
            var reloadingData = [];

            return {
                run: function (config) {
                    if (angular.isDefined(config) && angular.isDefined(config.name)) {
                        var loadingVar = '$dataLoading',
                            listVar = '$list',
                            totalRowsVar = '$totalRows',
                            reloadFunctionName = '$reloadData',
                            tableNameVar = '$tableName',
                            selectedItemsVar = '$selectedItems';

                        if (angular.isDefined(config.name)
                            && reloadingData.indexOf(config.name) == -1
                            && angular.isDefined(config.params)
                            && (angular.isUndefined(config[loadingVar]) || !config[loadingVar])) {
                            /** Push config name to reloadingData array */
                            reloadingData.push(config.name);

                            /** Set dataLoading status */
                            config[loadingVar] = true;

                            /** Set firstLoad status */
                            if (angular.isUndefined(config.params.firstLoad)) {
                                config.params.firstLoad = true;
                            }

                            /** Set table name */
                            if (angular.isUndefined(config[tableNameVar])) {
                                config[tableNameVar] = hlElementHelper.generateID(config.name);
                            }

                            /** Set selected items */
                            if (angular.isUndefined(config[selectedItemsVar])) {
                                config[selectedItemsVar] = [];
                            }

                            /** Default params */
                            var defaultParams = {
                                offset: 20,
                                ascDesc: 'ASC'
                            };

                            angular.extend(config.params, defaultParams);

                            var defer = $q.defer();

                            $http({
                                method: 'POST',
                                url: config.url,
                                data: config.params
                            }).then(function (response) {
                                    var result = response.data;

                                    // Set list
                                    if (angular.isDefined(result.dataList)) {
                                        config[listVar] = result.dataList;
                                    }

                                    if (angular.isDefined(config.params) && angular.isDefined(config.params.firstLoad) && config.params.firstLoad) {
                                        /** Reload filter from json */
                                        if (angular.isDefined(result) && angular.isDefined(result.paramSession)) {
                                            /** Check pageNum */
                                            if (angular.isDefined(result.paramSession.pageNum)) {
                                                config.params.pageNum = result.paramSession.pageNum;
                                            }

                                            /** Check offset */
                                            if (angular.isDefined(result.paramSession.offset)) {
                                                config.params.offset = result.paramSession.offset;
                                            }

                                            /** Check filter */
                                            if (angular.isDefined(result.paramSession.filter) && (result.paramSession.filter.length > 0 || Object.keys(result.paramSession.filter).length > 0)) {
                                                config.params.filter = result.paramSession.filter;
                                            }

                                            /** Check order_by */
                                            if (angular.isDefined(result.paramSession.orderBy)) {
                                                config.params.orderBy = result.paramSession.orderBy;
                                            }

                                            /** Check asc_desc */
                                            if (angular.isDefined(result.paramSession.ascDesc)) {
                                                config.params.ascDesc = result.paramSession.ascDesc;
                                            }
                                        }
                                    }

                                    defer.resolve(result);
                                }, function (error) {
                                    defer.reject(error);
                                })
                                .finally(function () {
                                    /** Remove config name in reloadingData array */
                                    reloadingData.splice(reloadingData.indexOf(config.name), 1);

                                    /** Reset dataLoading to false */
                                    $timeout(function () {
                                        config[loadingVar] = false;
                                    }, 500);
                                });

                            if (angular.isUndefined(config[reloadFunctionName])) {
                                config[reloadFunctionName] = function () {
                                    $http({
                                        method: 'POST',
                                        url: config.url,
                                        data: config.params
                                    }).then(function (response) {
                                            var result = response.data;

                                            // Set list
                                            if (angular.isDefined(result.dataList)) {
                                                config[listVar] = result.dataList;
                                            }

                                            if (angular.isDefined(config.params) && angular.isDefined(config.params.firstLoad) && config.params.firstLoad) {
                                                /** Reload filter from json */
                                                if (angular.isDefined(result) && angular.isDefined(result.paramSession)) {
                                                    /** Check pageNum */
                                                    if (angular.isDefined(result.paramSession.pageNum)) {
                                                        config.params.pageNum = result.paramSession.pageNum;
                                                    }

                                                    /** Check offset */
                                                    if (angular.isDefined(result.paramSession.offset)) {
                                                        config.params.offset = result.paramSession.offset;
                                                    }

                                                    /** Check filter */
                                                    if (angular.isDefined(result.paramSession.filter) && (result.paramSession.filter.length > 0 || Object.keys(result.paramSession.filter).length > 0)) {
                                                        config.params.filter = result.paramSession.filter;
                                                    }

                                                    /** Check order_by */
                                                    if (angular.isDefined(result.paramSession.orderBy)) {
                                                        config.params.orderBy = result.paramSession.orderBy;
                                                    }

                                                    /** Check asc_desc */
                                                    if (angular.isDefined(result.paramSession.ascDesc)) {
                                                        config.params.ascDesc = result.paramSession.ascDesc;
                                                    }
                                                }
                                            }
                                        }, function (error) {
                                            $log.error(error);
                                        })
                                        .finally(function () {
                                            /** Remove config name in reloadingData array */
                                            reloadingData.splice(reloadingData.indexOf(config.name), 1);

                                            /** Reset dataLoading to false */
                                            $timeout(function () {
                                                config[loadingVar] = false;
                                            }, 500);
                                        });
                                }
                            }

                            return defer.promise;

                        } else {
                            $log.error('[hlDataHelper] >> Invalid config.');
                        }
                    } else {
                        $log.error('[hlDataHelper] >> No config or name.');
                    }
                }
            }
        })
        .directive('hlTable', function ($rootScope, $http, $timeout, hlTableConfig) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                $scope: {
                    columns: '=',
                    config: '=',
                    messages: '='
                },
                templateUrl: hlTableConfig.templatePath + 'table.tpl.html',
                link: function ($scope, $element, $attrs) {
                }
            }
        })
        .directive('travisRow', function () {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                $scope: {
                    selectedList: '=',
                    travisSelected: '='
                },
                template: '<tr ng-class="{\'selected\': travisSelected}" ng-transclude></tr>',
                link: function ($scope, element, attrs) {
                    var allowAttrs = ['id', 'class', 'style'];
                    angular.forEach(allowAttrs, function (allowAttr) {
                        if (angular.isDefined(attrs[allowAttr])) {
                            element.attr(allowAttr, attrs[allowAttr]);
                        }
                    });
                }
            }
        })
        .directive('travisColumn', function ($timeout) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                $scope: true,
                template: '<td ng-show="column.display" ng-class="checkClass()" rowspan="{{ rowspan }}" colspan="{{ colspan }}" ng-transclude></td>',
                link: function ($scope, element, attrs) {
                    var columnIdx = angular.element(element).index();
                    var columnList = $scope.$parent.$parent.$parent.$parent.$parent.columns;

                    if (columnIdx > 0 && angular.isDefined(columnList) && angular.isArray(columnList) && angular.isDefined(columnList[columnIdx - 1])) {
                        $scope.column = columnList[columnIdx - 1];
                    }

                    if (angular.isDefined(attrs.colspan)) {
                        $scope.colspan = attrs.colspan;
                    }

                    if (angular.isDefined(attrs.rowspan)) {
                        $scope.rowspan = attrs.rowspan;
                    }

                    if (angular.isDefined($scope.column)) {
                        $scope.$watch('column.display', function (new_val) {
                            if (new_val) {
                                $scope.column.display = new_val;
                            }
                        }, true);
                    } else {
                        $scope.column = {
                            display: true
                        };
                    }

                    if (angular.isDefined($scope.column)) {
                        $scope.checkClass = function () {
                            var class_name = '';

                            if (angular.isDefined($scope.column.text_align)) {
                                class_name += 'uk-text-' + $scope.column.text_align;
                            }

                            if (angular.isDefined($scope.column.center_if_smaller)) {
                                class_name += ' center-if-smaller';
                            } else {
                                if (angular.isDefined($scope.column.setting_title)) {
                                    element.attr('data-label', $scope.column.setting_title);
                                } else {
                                    element.attr('data-label', $scope.column.title);
                                }
                            }

                            if (angular.isDefined(attrs.customClass)) {
                                class_name += ' ' + attrs.customClass;
                            }

                            return class_name;
                        };
                    }
                }
            }
        })
        .directive('travisColumn', function ($timeout) {
            return {
                restrict: 'A',
                $scope: {
                    column: '='
                },
                link: function ($scope, element, attrs) {
                    if ($scope.column.display) {
                        element.show();
                    } else {
                        element.hide();
                    }

                    $scope.$watch($scope.column.display, function (new_val, old_val) {
                        if (new_val != old_val) {
                            if (new_val) {
                                element.show();
                            } else {
                                element.hide();
                            }
                        }
                    });

                    if (angular.isDefined($scope.column)) {
                        var class_name = '';

                        if (angular.isDefined($scope.column.text_align)) {
                            class_name += 'uk-text-' + $scope.column.text_align;
                        }

                        if (angular.isDefined($scope.column.center_if_smaller)) {
                            class_name += ' center-if-smaller';
                        } else {
                            if (angular.isDefined($scope.column.setting_title)) {
                                element.attr('data-label', $scope.column.setting_title);
                            } else {
                                element.attr('data-label', $scope.column.title);
                            }
                        }

                        if (angular.isDefined(attrs.customClass)) {
                            class_name += ' ' + attrs.customClass;
                        }

                        element.addClass(class_name);
                    }
                }
            }
        })
        .directive('hlTableHeader', function ($rootScope, $timeout, $log, hlTableConfig) {
            return {
                restrict: 'E',
                replace: 'true',
                scope: {
                    columns: '=',
                    config: '='
                },
                templateUrl: hlTableConfig.templatePath + 'header.tpl.html',
                link: function ($scope, $element, $attrs) {
                    $scope.sortData = function (field) {
                        if (field == $scope.config.params.orderBy) {
                            if ($scope.config.params.ascDesc == 'ASC') {
                                $scope.config.params.ascDesc = 'DESC';
                            } else {
                                $scope.config.params.ascDesc = 'ASC';
                            }
                        } else {
                            $scope.config.params.orderBy = field;
                            $scope.config.params.ascDesc = 'DESC';
                        }

                        $scope.config.$reloadData();
                    };
                }
            }
        })
        .directive('travisFooter', function ($timeout) {
            return {
                restrict: 'A',
                $scope: {
                    columns: '=',
                    request: '=',
                    showWhen: '='
                },
                templateUrl: 'app/libs/travis/travisFooter.tpl.html',
                link: function ($scope, element, attrs) {
                    $timeout(function () {
                        $scope.$watch('request.offset', function () {
                            if (parseInt($scope.request.offset) >= $scope.showWhen) {
                                $(element).show();
                            } else {
                                $(element).hide();
                            }
                        });
                    });
                }
            }
        })
        .directive('hlTableSetting', function ($rootScope, $timeout, $log, $document, hlTableConfig) {
            return {
                restrict: 'E',
                $scope: {
                    columns: '=',
                    config: '='
                },
                templateUrl: hlTableConfig.templatePath + 'setting.tpl.html',
                link: function ($scope, $element, $attrs) {
                    if (angular.isDefined($scope.config) && angular.isDefined($scope.config.name)) {
                        var tableName = '#' + $scope.config.$tableName;

                        $scope.theme = {
                            fontSize: 14
                        };

                        $scope.pageSizes = [
                            {label: '20', value: 20},
                            {label: '50', value: 50},
                            {label: '75', value: 75},
                            {label: '100', value: 100}
                        ];

                        var changeFontSize = function (fontSize) {
                            var table = $document.find(tableName);
                            table.find('tbody').css({
                                'font-size': fontSize
                            });
                        };

                        $scope.$watch('theme.fontSize', function (newVal) {
                            if (angular.isDefined(newVal) && newVal) {
                                changeFontSize(newVal);
                            }
                        });

                        var defaultColumn = {
                            display: true,
                            canHide: true,
                            canFilter: true,
                            canSort: true
                        };

                        /** set some default attribute **/
                        $scope.setupColumns = function () {
                            if (angular.isDefined($scope.columns) && angular.isArray($scope.columns)) {
                                angular.forEach($scope.columns, function (col, idx) {
                                    angular.extend(col, defaultColumn);
                                });
                            } else {
                                $log.error('[hlTableSetting] >> columns is undefined.');
                            }
                        }

                        /** First loading */
                        $scope.setupColumns();

                        $scope.$watch("columns", function (newVal, oldVal) {
                            if (!angular.equals(newVal, oldVal)) {
                                $scope.setupColumns();
                            }
                        });

                        $scope.toggleAll = function (status) {
                            if (angular.isDefined($scope.columns) && angular.isArray($scope.columns)) {
                                angular.forEach($scope.columns, function (col, idx) {
                                    if (angular.isDefined(col.canhide) && col.canHide) {
                                        col.display = status;
                                    }
                                });
                            } else {
                                $log.error('[hlTableSetting] >> columns is undefined.');
                            }
                        }
                    }
                }
            }
        })
        .directive('travisFilter', function ($rootScope, $timeout, $mdpDatePicker, $mdpTimePicker) {
            return {
                restrict: 'EA',
                $scope: {
                    columns: '=',
                    request: '=',
                    reloadFunction: '&'
                },
                templateUrl: 'app/libs/travis/travisFilter.tpl.html',
                link: function ($scope, element, attrs) {
                    $scope.filterSymbols = ['>', '>=', '<', '<='];
                    $scope.selectizeOptions = [];
                    $scope.selectizeConfig = {
                        plugins: {
                            'remove_button': {
                                label: ''
                            }
                        },
                        create: true,
                        placeholder: 'Search...',
                        highlight: true
                    };

                    if (angular.isUndefined(attrs.reloadFunction)) {
                        console.error('travisFilter: reload function not found');
                    }

                    /**
                     * Fix filter format error
                     */
                    $timeout(function () {
                        if (angular.isDefined($scope.request.filter) && Object.keys($scope.request.filter).length > 0) {
                            $scope.filter = $scope.request.filter;
                        } else {
                            $scope.request.filter = {};
                            $scope.filter = {};
                        }

                        $scope.select_all = true;
                    });

                    /** filter **/
                    if (angular.isDefined($scope.columns) && angular.isArray($scope.columns)) {
                        angular.forEach($scope.columns, function (col, idx) {
                            if (angular.isDefined(col.options) && angular.isDefined(col.options.scope_name)) {
                                $scope.$parent.$parent.$watch(col.options.scope_name, function (new_val) {
                                    if (angular.isDefined(new_val)) {
                                        //console.log(new_val);
                                        col.options.data = new_val;
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('Bug: Columns collection is undefined.');
                    }

                    $scope.checkFilterValue = function () {
                        var result = false;

                        if (angular.isDefined($scope.request.filter) && Object.keys($scope.request.filter).length) {
                            angular.forEach($scope.request.filter, function (item, idx) {
                                if (!result) {
                                    if (item.value != '') {
                                        result = true;
                                    }
                                }
                            });
                        }

                        return result;
                    };

                    $scope.checkFilterSymbol = function (symbol, checkSymbol) {
                        if (symbol === checkSymbol || checkSymbol.substr(0, 1) == symbol || symbol.substr(0, 1) == checkSymbol) {
                            return false;
                        } else {
                            return true;
                        }
                    };

                    /** Create column filter structure */
                    var buildColFilter = function (col) {
                        var field_filter = {field: col.field, type: col.type, sub_type: col.sub_type};

                        switch (col.type) {
                            case 'text':
                            case 'bool':
                                field_filter.value = angular.isDefined(col.default_value) ? col.default_value : '';
                                break;
                            case 'date':
                                field_filter.value = angular.isDefined(col.default_value) && angular.isArray(col.default_value) ? col.default_value : [null, null];
                                break;
                            case 'select':
                                field_filter.value = angular.isDefined(col.default_value) && angular.isArray(col.default_value) ? col.default_value : [];
                                if (angular.isDefined(col.options) && angular.isDefined(col.options.filter_field)) {
                                    field_filter.field = col.options.filter_field;
                                }
                                break;
                            case 'mix':
                                if (angular.isDefined(col.sub_type) && col.sub_type == 'range') {
                                    var defaultVal = [
                                        {
                                            symbol: '>',
                                            value: 0
                                        }, {
                                            symbol: '<',
                                            value: 9999
                                        }
                                    ];
                                    field_filter.range = angular.isDefined(col.default_value) && angular.isArray(col.default_value) ? col.default_value : defaultVal;
                                } else {
                                    field_filter.value = angular.isDefined(col.default_value) ? col.default_value : 0;
                                    field_filter.symbol = angular.isDefined(col.default_symbol) ? col.default_symbol : '>';
                                }
                                break;
                        }

                        return field_filter;
                    };

                    $scope.submitFilter = function (is_click) {
                        if ($scope.checkFilterValue() || (angular.isDefined(is_click) && is_click)) {
                            $scope.request.page_num = 0;

                            /** Fix filter structure */
                            if (angular.isDefined($scope.request) && angular.isDefined($scope.request.filter) && angular.isDefined($scope.columns)) {
                                var filterKeys = Object.keys($scope.request.filter);
                                if (filterKeys.length > 0) {
                                    var newFilter = {};
                                    angular.forEach($scope.columns, function (col, idx) {

                                        if (angular.isDefined(col.field) && col.field != '' && filterKeys.indexOf(col.field) != -1) {
                                            /** Add some fields to error filter */
                                            if (angular.isUndefined($scope.request.filter[col.field].field)) {
                                                $scope.request.filter[col.field].field = col.field;
                                            }

                                            if (angular.isUndefined($scope.request.filter[col.field].type) ||
                                                $scope.request.filter[col.field].type != col.type ||
                                                (
                                                    angular.isDefined($scope.request.filter[col.field].sub_type) &&
                                                    angular.isDefined(col.sub_type) &&
                                                    $scope.request.filter[col.field].sub_type != col.sub_type
                                                ) || (
                                                    angular.isUndefined($scope.request.filter[col.field].sub_type) &&
                                                    angular.isDefined(col.sub_type)
                                                ) || (
                                                    angular.isDefined($scope.request.filter[col.field].sub_type) &&
                                                    angular.isUndefined(col.sub_type)
                                                )
                                            ) {
                                                $scope.request.filter[col.field] = buildColFilter(col);
                                            }

                                            newFilter[col.field] = $scope.request.filter[col.field];
                                        }
                                    });

                                    $scope.request.filter = newFilter;
                                }
                            }

                            //console.log('Submit filter');
                            $scope.reloadFunction();
                        }
                    };

                    $scope.clearFilter = function () {
                        if (angular.isDefined($scope.request.filter) && Object.keys($scope.request.filter).length) {
                            angular.forEach($scope.columns, function (col, idx) {
                                if (col.can_filter) {
                                    $scope.request.filter[col.field] = $scope.request.filter[col.field] = buildColFilter(col);
                                }
                            });

                            $scope.request.page_num = 0;
                            //console.log('Clear filter');
                            $scope.reloadFunction();
                        }
                    };

                    $scope.colFilter = function (col) {
                        if (col.filter) {
                            if (!scope.request.filter.hasOwnProperty(col.field)) {
                                $scope.request.filter[col.field] = buildColFilter(col);
                            }
                        } else {
                            if ($scope.request.filter.hasOwnProperty(col.field)) {
                                var filter_value = angular.copy($scope.request.filter[col.field].value);
                                delete $scope.request.filter[col.field];

                                if ($scope.checkFilterValue() || filter_value != '') {
                                    $scope.request.page_num = 0;
                                    //console.log('Col filter');
                                    $scope.reloadFunction();
                                }
                            }
                        }
                    };

                    /** Date filter */
                    $scope.showDatePicker = function (ev, field, idx) {
                        if (angular.isUndefined($scope.request.filter[field]) || angular.isUndefined($scope.request.filter[field].value) || !angular.isArray($scope.request.filter[field].value)) {
                            $scope.request.filter[field].value = [null, null];
                        }

                        var currentDate = $scope.request.filter[field].value[idx] ? $scope.request.filter[field].value[idx] : new Date();
                        var config = {};

                        if (idx === 1) {
                            config = {
                                targetEvent: ev,
                                minDate: $scope.request.filter[field].value[0]
                            };
                        } else {
                            config = {
                                targetEvent: ev,
                                maxDate: $scope.request.filter[field].value[1]
                            };
                        }

                        $mdpDatePicker(currentDate, config).then(function (date) {
                            $scope.request.filter[field].value[idx] = date;
                        });
                    };

                    $scope.dateFormat = function (val, str_format) {
                        var d = moment(val);
                        return d.format(str_format);
                    };

                    /** end Date filter */

                    $scope.toggleAll = function (status) {
                        if (angular.isDefined($scope.columns) && angular.isArray($scope.columns)) {
                            angular.forEach($scope.columns, function (col, idx) {
                                if (col.can_filter) {
                                    if (angular.isUndefined(col.default_filter) || !col.default_filter) {
                                        col.filter = status;
                                    }

                                    if (status) {
                                        if (!scope.request.filter.hasOwnProperty(col.field)) {

                                            $scope.request.filter[col.field] = buildColFilter(col);
                                            ;
                                        }
                                    } else {
                                        if ($scope.request.filter.hasOwnProperty(col.field)) {
                                            if (angular.isUndefined(col.default_filter) || !col.default_filter) {
                                                delete $scope.request.filter[col.field];
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            console.log('Bug: Columns collection is undefined.');
                        }
                    };
                }
            }
        })
        .directive('travisPagination', function ($rootScope, $timeout, $window) {
            return {
                restrict: 'A',
                $scope: {
                    totalRows: '=',
                    request: '=',
                    showFilter: '=',
                    reloadFunction: '&'
                },
                templateUrl: 'app/libs/travis/travisPagination.tpl.html',
                link: function ($scope, element, attrs) {
                    $scope.$watch('totalRows', function (newVal, oldVal) {
                        if (newVal) {
                            $scope.total_rows = newVal;
                            $scope.page_num = 0;

                            $scope.buildPagination();
                        }
                    });

                    if (angular.isUndefined(attrs.reloadFunction)) {
                        console.error('travisPagination: reload function not found');
                    }

                    $scope.pagiCenter = false;
                    $scope.page_num = 0;
                    $scope.from_row = 0;
                    $scope.to_row = 0;
                    $scope.num_links = 5;

                    $timeout(function () {
                        $scope.total_rows = $scope.totalRows;
                        $scope.records_per_page = $scope.request.offset;

                        $scope.buildPagination();
                    });

                    $scope.buildPagination = function (reload_data) {
                        /**
                         * Fix page_num greater than total rows
                         */
                        if ($scope.request.offset * $scope.request.page_num > $scope.totalRows) {
                            $scope.request.page_num = 0;
                        }

                        /** reset page_num after load request file */
                        $scope.page_num = $scope.request.page_num;

                        $scope.page_links = [];
                        $scope.total_rows = $scope.totalRows;
                        $scope.from_row = 0;
                        $scope.to_row = 0;
                        $scope.records_per_page = $scope.request.offset;

                        if ($scope.total_rows > 0) {
                            $scope.from_row = ($scope.records_per_page * $scope.page_num) + 1;
                        } else {
                            $scope.from_row = 0;
                        }

                        $scope.to_row = $scope.records_per_page * ($scope.page_num + 1);
                        //fix to_row if more than total rows
                        if ($scope.to_row > $scope.total_rows) {
                            $scope.to_row = $scope.total_rows;
                        }

                        if ($scope.total_rows % $scope.records_per_page > 0) {
                            $scope.page_limit = (Math.floor($scope.total_rows / $scope.records_per_page)) + 1;
                        } else {
                            $scope.page_limit = $scope.total_rows / $scope.records_per_page;
                        }

                        if ($scope.page_limit <= $scope.num_links) {
                            $scope.page_range = [1, $scope.page_limit];
                        } else {
                            var page_min = 0;
                            var page_max = 0;

                            if ($scope.page_num - Math.floor($scope.num_links / 2) > 0) {
                                page_min = $scope.page_num - Math.floor($scope.num_links / 2) + 1;
                            } else {
                                page_min = 1;
                            }

                            if (page_min == 1) {
                                page_max = $scope.num_links;
                            } else {
                                if ($scope.page_num + Math.floor($scope.num_links / 2) < $scope.page_limit + 1) {
                                    page_max = $scope.page_num + Math.floor($scope.num_links / 2) + 1;
                                    if (page_max > $scope.page_limit) {
                                        page_min -= 1;
                                        page_max -= 1;
                                    }
                                } else {
                                    page_min = $scope.page_num - Math.floor($scope.num_links / 2) - ($scope.num_links % 2);
                                    page_max = $scope.page_limit;
                                }
                            }

                            $scope.page_range = [page_min, page_max];
                        }

                        for (var i = $scope.page_range[0]; i < $scope.page_range[1] + 1; i++) {
                            $scope.page_links.push(i);
                        }

                        if ((angular.isDefined(reload_data) && reload_data)) {
                            //console.log('Pagination');
                            $scope.reloadFunction();
                        }
                    };

                    $scope.goPage = function (page_num) {
                        var reload = false;

                        if (page_num < 0) {
                            page_num = 0;
                        }

                        if (page_num >= $scope.page_limit) {
                            page_num = $scope.page_limit - 1;
                        }

                        if (page_num != $scope.page_num && page_num >= 0 && page_num <= $scope.page_limit) {
                            reload = true;
                        }

                        if (reload) {
                            $scope.page_num = page_num;
                            $scope.request.page_num = page_num;
                            $scope.buildPagination(true);
                        }
                    };

                    //pagasize handler
                    var offsetCounter = 0;
                    $scope.$watch("request.offset", function (newVal, oldVal) {
                        //console.log(offsetCounter);
                        if (newVal == 25 && oldVal == 25) {
                            offsetCounter += 1;
                        }

                        if (newVal != oldVal) {

                            if (newVal == null) {
                                $scope.request.offset = 25;
                            }

                            $scope.page_num = 0;
                            //console.log('watch offset');

                            if (offsetCounter > 1) {
                                $scope.buildPagination(true);
                            } else {
                                $scope.buildPagination();
                            }
                        }

                        offsetCounter++
                    });

                    //page number changing handler
                    $scope.$watch("page_num", function (val) {
                        if (angular.isDefined(val) && angular.isNumber(val)) {
                            $scope.page_num_input = val + 1;
                        }
                    }, true);

                    $scope.paginationMini = false;

                    /*scope.$watch(function () {
                     return angular.element(element).find('.uk-pagination').width();
                     }, function (newWidth) {
                     var windowWidth = angular.element(element).closest('.md-card-content').width();
                     console.log(newWidth + '/' + windowWidth);

                     if (angular.isDefined(newWidth) && newWidth != null && newWidth != 0) {
                     if (newWidth <= 320) {
                     $scope.paginationMini = true;
                     $scope.pagiCenter = true;
                     } else {
                     var fix = 0;
                     if($scope.page_num > 0){
                     fix = fix + (48*2);
                     }

                     if($scope.page_num < $scope.page_limit -1){
                     fix = fix + (48*2);
                     }

                     $scope.num_links = Math.ceil((newWidth- fix - 100) / 48);

                     if($scope.num_links > 5){
                     $scope.num_links = 5;
                     }

                     $scope.paginationMini = false;
                     $scope.pagiCenter = false;
                     }
                     }
                     });*/
                }
            }
        })
        .directive('travisCheckall', function ($timeout) {
            return {
                restrict: 'A',
                $scope: {
                    listData: '=',
                    selectedList: '=',
                    label: '=',
                    request: '='
                },
                template: '<md-checkbox md-no-ink ng-model="check_all" ng-change="checkAllItem()" aria-label="check_all" style="margin-bottom: 0;"><span ng-if="label" class="uk-text-bold" >&nbsp;&nbsp;{{label}}</span></md-checkbox>',
                link: function ($scope, element, attrs) {
                    $scope.check_all = false;

                    if (angular.isDefined($scope.request)) {
                        $scope.$watch('request.page_num', function (new_val, old_val) {
                            if (new_val != old_val) {
                                $scope.check_all = false;
                                $scope.selectedList = [];
                            }
                        });
                    }

                    $scope.checkAllItem = function () {
                        if (angular.isDefined($scope.selectedList)) {
                            if (angular.isDefined($scope.listData) && $scope.listData.length) {
                                angular.forEach($scope.listData, function (item, idx) {
                                    item.is_checked = $scope.check_all;

                                    if ($scope.check_all == true) {
                                        if (jQuery.inArray(item.id, $scope.selectedList) == -1) {
                                            $scope.selectedList.push(item.id);
                                        }
                                    } else {
                                        if (jQuery.inArray(item.id, $scope.selectedList) > -1) {
                                            $scope.selectedList.splice($scope.selectedList.indexOf(item.id), 1);
                                        }
                                    }
                                });
                            }
                        }
                    };

                    /**
                     * Uncheck check-all checkbox
                     */
                    $timeout(function () {
                        $scope.$watch('selectedList', function (newVal) {
                            if (newVal && newVal.length == 0) {
                                $scope.check_all = false;
                            }
                        }, true);
                    });
                }
            }
        })
        .directive('travisCheckboxItem', function ($timeout) {
            return {
                restrict: 'E',
                require: 'ngModel',
                $scope: {
                    selectedList: '='
                },
                template: '<md-checkbox md-no-ink ng-model="ngModel" aria-label="checkbox_item"></md-checkbox>',
                link: function ($scope, element, attrs, ngModel) {

                    element.on('click', function () {
                        if (jQuery.inArray(ngModel.$viewValue, $scope.selectedList) == -1) {
                            $scope.selectedList.push(ngModel.$viewValue);
                        } else {
                            $scope.selectedList.splice($scope.selectedList.indexOf(ngModel.$viewValue), 1);
                        }
                    });

                    $scope.$watch(function () {
                        return $scope.selectedList;
                    }, function (new_val) {
                        var selectedList = new_val;

                        if (angular.isDefined(selectedList)) {
                            if (jQuery.inArray(ngModel.$viewValue, selectedList) > -1) {
                                element.find('md-checkbox').addClass('md-checked');
                                element.closest('tr').addClass('selected');
                            } else {
                                element.find('md-checkbox').removeClass('md-checked');
                                element.closest('tr').removeClass('selected');
                            }
                        }
                    }, true);
                }
            }
        })
        .directive('travisEnterEvent', function () {
            return function ($scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        $scope.$apply(function () {
                            $scope.$eval(attrs.travisEnterEvent);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .directive('bindHtmlCompile', ['$compile', function ($compile) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    $scope.$watch(function () {
                        return $scope.$eval(attrs.bindHtmlCompile);
                    }, function (value) {
                        element.html(value);
                        $compile(element.contents())($scope);
                    });
                }
            };
        }])
        .directive('velocityList', function ($timeout, variables) {
            return {
                restrict: 'A',
                transclude: true,
                template: '<span data-uk-tooltip="{pos:\'top-right\'}" title="{{scope.content}}"><ng-transclude></ng-transclude></span>',
                link: function ($scope, element, attrs) {
                    $timeout(function () {
                        element.on('click', '.md-card-list ul > li', function (e) {
                            var $this = $(this);

                            if (!$this.hasClass('item-shown')) {
                                if (!$this.hasClass('not-click')) {
                                    //Add cursor pointer
                                    $this.css({'cursor': 'pointer'});

                                    // get height of clicked message
                                    var el_min_height = $this.height() + $this.children('.md-card-list-item-content-wrapper').actual("height");

                                    // hide opened message
                                    element.find('.item-shown').velocity("reverse", {
                                        begin: function (elements) {
                                            $(elements).removeClass('item-shown').children('.md-card-list-item-content-wrapper').hide().velocity("reverse");
                                        }
                                    });

                                    // show message
                                    $this.velocity({
                                        marginTop: 40,
                                        marginBottom: 40,
                                        marginLeft: 0,
                                        marginRight: 0,
                                        minHeight: el_min_height
                                    }, {
                                        duration: 200,
                                        easing: variables.easing_swiftOut,
                                        begin: function (elements) {
                                            $(elements).addClass('item-shown');
                                        },
                                        complete: function (elements) {
                                            // show: message content, reply form
                                            $(elements).children('.md-card-list-item-content-wrapper').show().velocity({
                                                opacity: 1
                                            });

                                            // scroll to message
                                            var container = $('body'),
                                                scrollTo = $(elements);
                                            container.animate({
                                                scrollTop: scrollTo.offset().top - $('#page_content').offset().top - 8
                                            }, 500, variables.bez_easing_swiftOut);

                                        }
                                    });
                                }
                            } else {
                                element.find('.item-shown').velocity("reverse", {
                                    begin: function (elements) {
                                        $(elements).removeClass('item-shown').children('.md-card-list-item-content-wrapper').hide().velocity("reverse");
                                    }
                                });
                            }
                        });
                    });
                }
            }
        })
        /**
         * Draggle element
         * @author HuuLe
         */
        .directive('myDraggable', ['$document', function ($document) {
            return {
                link: function ($scope, element, attr) {
                    var startX = 0, startY = 0, x = 0, y = 0;

                    element.css({
                        position: 'relative',
                        border: '1px solid red',
                        backgroundColor: 'lightgrey',
                        cursor: 'pointer'
                    });

                    element.on('mousedown', function (event) {
                        // Prevent default dragging of selected content
                        event.preventDefault();
                        startX = event.pageX - x;
                        startY = event.pageY - y;
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                    });

                    function mousemove(event) {
                        y = event.pageY - startY;
                        x = event.pageX - startX;
                        element.css({
                            top: y + 'px',
                            left: x + 'px'
                        });
                    }

                    function mouseup() {
                        $document.off('mousemove', mousemove);
                        $document.off('mouseup', mouseup);
                    }
                }
            };
        }])
        /**
         * Toggle published field
         * @author HuuLe
         */
        .directive('toggleData', function ($rootScope, $timeout, $mdDialog, sTravis) {
            return {
                restrict: 'E',
                $scope: {
                    ngModel: '=',
                    refId: '=',
                    confirm: '=',
                    options: '=',
                    disabled: '@',
                    tableName: '@',
                    fieldName: '@'
                },
                template: '<a ng-if="!disabled" ng-hide="ngModel == -999" ng-click="updateField($event)">' +
                '<i class="{{ ngModel == options.true.value ? options.true.class : (ngModel == options.false.value ? options.false.class : \'icon-alert-circle uk-text-muted s24\') }}"></i>' +
                '</a><i ng-if="disabled" class="{{ ngModel == options.true.value ? options.true.class : (ngModel == options.false.value ? options.false.class : \'icon-alert-circle uk-text-muted s24\') }}"></i>' +
                '<md-preloader ng-show="ngModel == -999" width="24" height="24"></md-preloader>',
                link: function ($scope, element, attrs) {
                    if (angular.isUndefined($scope.disabled)) {
                        $scope.disabled = false;
                    }

                    if (angular.isUndefined($scope.options)) {
                        $scope.options = {
                            true: {
                                class: 'icon-check uk-text-success s24',
                                value: '1'
                            },
                            false: {
                                class: 'icon-close uk-text-danger s24',
                                value: '0'
                            }
                        };
                    } else {
                        if (angular.isUndefined($scope.options.true)) {
                            $scope.options.true = {
                                class: 'icon-check uk-text-success s24',
                                value: '1'
                            };
                        } else {
                            if (angular.isUndefined($scope.options.true.class)) {
                                $scope.options.true.class = 'icon-check uk-text-success s24';
                            }

                            if (angular.isUndefined($scope.options.true.value)) {
                                $scope.options.true.value = '1';
                            }
                        }

                        if (angular.isUndefined($scope.options.false)) {
                            $scope.options.false = {
                                class: 'icon-close uk-text-danger s24',
                                value: '0'
                            };
                        } else {
                            if (angular.isUndefined($scope.options.false.class)) {
                                $scope.options.false.class = 'icon-close uk-text-danger s24';
                            }

                            if (angular.isUndefined($scope.options.false.value)) {
                                $scope.options.false.value = '0';
                            }
                        }
                    }

                    $scope.showConfirm = function (ev) {
                        var confirm = $mdDialog.confirm({
                                onShowing: function ($scope, element) {
                                    $timeout(function () {

                                        var mdDialog = $(element[0]).find('md-dialog');
                                        var buttons = $(mdDialog.find('md-dialog-actions')).children();
                                        mdDialog.css({width: '400px'});

                                        $(buttons[0]).removeClass('md-primary');
                                    });
                                }
                            })
                            .title((angular.isDefined($scope.confirm.title) ? $scope.confirm.title : 'Update field?'))
                            .textContent('')
                            .ariaLabel('Update field')
                            .targetEvent(ev)
                            .ok('OK')
                            .cancel('Cancel');

                        return $mdDialog.show(confirm);
                    };

                    $scope.updateField = function () {
                        if (angular.isDefined($scope.confirm)) {
                            $scope.showConfirm().then(function () {
                                $scope.updateData();
                            });
                        } else {
                            $scope.updateData();
                        }
                    };

                    $scope.updateData = function () {
                        var bkVal = angular.copy($scope.ngModel);
                        var newVal = $scope.ngModel == $scope.options.true.value ? $scope.options.false.value : $scope.options.true.value;
                        var updateField = angular.isDefined($scope.fieldName) ? $scope.fieldName : 'published';
                        var updateParams = {};
                        updateParams[updateField] = newVal;

                        var updateData = {
                            tableName: $scope.tableName,
                            refId: $scope.refId,
                            updateData: updateParams
                        };

                        $scope.ngModel = -999;
                        $rootScope.content_preloader_show();

                        sTravis.$qHttpPost({
                            url: $rootScope.model + "directive/updateField",
                            request: updateData
                        }).then(function (response) {
                            var status = '';
                            var result = response.data.dataResponse;
                            if (result.success) {
                                $scope.ngModel = newVal;
                                status = 'success';
                            } else {
                                $scope.ngModel = bkVal;
                                status = 'error';
                            }

                            UIkit.notify({
                                message: result.msg,
                                status: status,
                                timeout: 3000,
                                pos: 'top-center'
                            });
                            $rootScope.content_preloader_hide();
                        }, function (error) {
                            console.log(error);

                            $scope.ngModel = bkVal;
                            $rootScope.content_preloader_hide();
                        });
                    };
                }
            }
        })
        .directive('travisSelection', function ($rootScope, $timeout, $q, sTravis) {
            function checkDataDefined(item) {
                var undefinedCounter;

                if (angular.isDefined(item) && item) {
                    if (angular.isObject(item) && Object.keys(item).length > 0) {
                        undefinedCounter = 0;
                        angular.forEach(item, function (value, key) {
                                if (typeof value === 'undefined') {
                                    undefinedCounter++;
                                }
                            }
                        );

                        if (Object.keys(item).length === undefinedCounter) {
                            return false;
                        } else {
                            return true;
                        }
                    } else if (angular.isArray(item) && item.length > 0) {
                        undefinedCounter = 0;
                        angular.forEach(item, function (value, key) {
                                if (typeof value === 'undefined') {
                                    undefinedCounter++;
                                }
                            }
                        );

                        if (Object.keys(item).length === undefinedCounter) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                } else {
                    return false;
                }
            }

            return {
                restrict: 'E',
                $scope: {
                    ngModel: '=',
                    disabled: '=',
                    requestParam: '=',
                    asyncResolved: '=',
                    waiting: '=',
                    requestUrl: '@',
                    type: '@',
                    textField: '@',
                    valueField: '@',
                    placeholder: '@'
                },
                templateUrl: function (element, attrs) {
                    var allowedType = ['combo-box', 'drop-down-list', 'multi-select'];
                    if (angular.isDefined(attrs.type) && allowedType.indexOf(attrs.type) > -1) {
                        return 'app/libs/travis/selection/' + attrs.type + '.tpl.html';
                    } else {
                        console.error('[Dir]travis-selection: Invalid type.')
                    }
                },
                link: function ($scope, element, attrs) {
                    $scope.dataSource = undefined;

                    if (angular.isUndefined($scope.waiting)) {
                        $scope.waiting = false;
                    }

                    if (angular.isUndefined($scope.disabled)) {
                        $scope.disabled = false;
                    }

                    $scope.kendoMultiSelectConfig = {
                        placeholder: $scope.placeholder,
                        dataTextField: $scope.textField,
                        dataValueField: $scope.valueField,
                        valuePrimitive: true,
                        autoBind: false,
                        filter: false,
                        autoClose: false
                    };

                    if (angular.isUndefined($scope.requestParam)) {
                        $scope.requestParam = {};
                    }

                    function loadData() {
                        $scope.sourceLoading = true;

                        sTravis.$qHttpPost({
                                url: $rootScope.model + $scope.requestUrl,
                                request: $scope.requestParam
                            })
                            .then(function (response) {
                                var result = response.data.dataResponse;
                                if (result) {
                                    $scope.dataSource = result;
                                } else {
                                    $scope.dataSource = [];
                                }

                                $scope.sourceLoading = false;
                            }, function (error) {
                                console.error(error);
                            });
                    }

                    $scope.$watch('requestParam', function (newVal, oldVal) {
                        if (newVal && checkDataDefined(newVal) || angular.isUndefined($scope.dataSource)) {
                            loadData();
                        }
                    });
                }
            }
        })
        .directive('travisDatePicker', function ($rootScope, $timeout, $mdpDatePicker, $mdpTimePicker) {
            return {
                restrict: 'E',
                $scope: {
                    ngModel: '=',
                    dateFormat: '@'
                },
                templateUrl: function (element, attrs) {
                    var allowedType = ['single', 'multi', 'range'];

                    if (angular.isDefined(attrs.type) && allowedType.indexOf(attrs.type) > -1) {
                        return 'app/libs/travis/date-picker/' + attrs.type + '.tpl.html';
                    } else {
                        console.error('[Dir]travis-date-picker: invalid type.');
                        return false;
                    }
                },
                link: function ($scope, element, attrs) {
                    //Config
                    $scope.selectizeOptions = [];
                    $scope.selectizeConfig = {
                        plugins: {
                            'remove_button': {
                                label: ''
                            }
                        },
                        maxItems: null,
                        valueField: 'id',
                        labelField: 'title',
                        searchField: 'title',
                        placeholder: 'Select a date',
                        create: true
                    };

                    if (angular.isUndefined($scope.dateFormat)) {
                        $scope.dateFormat = 'YYYY-MM-DD'; //2016-01-01
                    }

                    //Format date
                    $scope.formatDate = function (val, strFormat) {
                        var d = moment(val);
                        if (angular.isUndefined(strFormat)) {
                            strFormat = 'YYYY-MM-DD';
                        }
                        return d.format(strFormat);
                    };

                    if (angular.isDefined(attrs.type)) {
                        if (angular.isUndefined($scope.ngModel) || !scope.ngModel) {
                            switch (attrs.type) {
                                case 'single':
                                    $scope.ngModel = $scope.formatDate(new Date(), $scope.dateFormat);
                                    break;
                                case 'multi':
                                    $scope.ngModel = [];
                                    break;
                                case 'range':
                                    $scope.ngModel = [null, null];
                                    break;
                            }
                        }
                    }

                    // Date Picker
                    $scope.showDatePicker = function (ev, strFormat, idx) {
                        switch (attrs.type) {
                            case 'single':
                                var currentDate = $scope.ngModel ? $scope.ngModel : new Date();

                                $mdpDatePicker(currentDate, {targetEvent: ev}).then(function (date) {
                                    $scope.ngModel = $scope.formatDate(date, strFormat);
                                });
                                break;
                            case 'multi':
                                var currentDate = new Date();

                                $mdpDatePicker(currentDate, {targetEvent: ev}).then(function (date) {
                                    var newDate = $scope.formatDate(date, strFormat);
                                    if (angular.isArray($scope.ngModel) && $scope.ngModel.indexOf(newDate) == -1) {
                                        $scope.ngModel.push(newDate);
                                    }
                                });
                                break;
                            case 'range':
                                var currentDate = $scope.ngModel[idx] ? $scope.ngModel[idx] : new Date();

                                var config = {};

                                if (idx === 1) {
                                    config = {
                                        targetEvent: ev,
                                        minDate: $scope.ngModel[0]
                                    };
                                } else {
                                    config = {
                                        targetEvent: ev,
                                        maxDate: $scope.ngModel[1]
                                    };
                                }

                                $mdpDatePicker(currentDate, config).then(function (date) {
                                    $scope.ngModel[idx] = $scope.formatDate(date, strFormat);
                                });
                                break;
                        }
                    };

                    //Reset date
                    $scope.resetDate = function () {
                        if (angular.isDefined(attrs.type)) {
                            switch (attrs.type) {
                                case 'single':
                                    $scope.ngModel = null;
                                    break;
                                case 'multi':
                                    $scope.ngModel = [];
                                    break;
                                case 'range':
                                    $scope.ngModel = [null, null];
                                    break;
                            }
                        }
                    };

                    // Remove date
                    $scope.removeDate = function (date) {
                        if ($scope.ngModel.indexOf(date) > -1) {
                            $scope.ngModel.splice($scope.ngModel.indexOf(date), 1);
                        }
                    };
                }
            }
        })
        .directive('travisExportBtn', function ($rootScope, $timeout, $window, $filter, sTravis) {
            return {
                restrict: 'E',
                transclude: true,
                template: '<ng-transclude ng-hide="exportDownloading"></ng-transclude><md-preloader ng-show="exportDownloading" stroke-width="4" width="24" height="24"></md-preloader>',
                $scope: {
                    params: '=',
                    currentTotal: '=',
                    shortCode: '@'
                },
                link: function ($scope, element, attrs) {
                    function showNotify(message, status, timeout, group, position, callback) {
                        var w = angular.element($window);

                        var thisNotify = UIkit.notify({
                            message: message,
                            status: status ? status : '',
                            timeout: timeout ? timeout : 5000,
                            group: group ? group : '',
                            pos: position ? position : 'top-center',
                            onClose: function () {
                                $('body').find('.md-fab-wrapper').css('margin-bottom', '');
                                clearTimeout(thisNotify.timeout);

                                if (callback) {
                                    if (angular.isFunction(callback())) {
                                        $scope.$apply(callback());
                                    } else {
                                        console.log('Callback is not a function');
                                    }
                                }

                            }
                        });
                        if (
                            ( (w.width() < 768) && (
                                (position == 'bottom-right')
                                || (position == 'bottom-left')
                                || (position == 'bottom-center')
                            ) )
                            || (position == 'bottom-right')
                        ) {
                            var thisNotify_height = $(thisNotify.element).outerHeight(),
                                spacer = (w.width() < 768) ? -6 : 8;
                            $('body').find('.md-fab-wrapper').css('margin-bottom', thisNotify_height + spacer);
                        }
                    };

                    $(element).on('click', function (ev) {
                        if (angular.isDefined($scope.currentTotal) && $scope.currentTotal !== '' && $scope.currentTotal !== null) {
                            var currentTotal = parseInt($scope.currentTotal);

                            if (currentTotal === 0) {
                                showNotify('No data.', 'warning');
                            } else if (currentTotal > 2000) {
                                showNotify('Data is over <b>' + $filter('number')(2000) + ' rows</b>. Please <b>change the filter</b> and try again.', 'warning');
                            } else {
                                if (angular.isDefined($scope.shortCode)) {
                                    $scope.exportDownloading = true;

                                    sTravis.$qHttpPost({
                                        url: $rootScope.model + 'export/download/' + $scope.shortCode,
                                        request: $scope.params
                                    }).then(function (response) {
                                        var result = response.data.dataResponse;

                                        if (result) {
                                            if (angular.isDefined(result.success)) {
                                                if (result.success === true) {
                                                    showNotify(result.msg, 'success');
                                                    document.location = result.url;
                                                    //sTravis.downloadFileHelper(result.url, result.fileName);
                                                } else {
                                                    showNotify(result.msg, 'warning');
                                                }
                                            } else {
                                                showNotify("Error.", 'danger');
                                            }
                                        } else {
                                            showNotify("Error.", 'danger');
                                        }
                                    }, function (error) {
                                        console.error(error);
                                    }).finally(function () {
                                        $scope.exportDownloading = false;
                                    });
                                } else {
                                    console.error('[Dir]travis-export-btn: Invalid short code.');
                                }
                            }
                        } else {
                            console.error('[Dir]travis-export-btn: Invalid current total.');
                        }
                    });
                }
            }
        })

        // Some shortly functions
        .factory('ftCommonHelper', function () {
            return {
                isDefined: function (testVar) {
                    if (angular.isDefined(testVar))
                        return true;
                    return false;
                },
                isUndefined: function (testVar) {
                    if (angular.isUndefined(testVar))
                        return true;
                    return false;
                },
                isNumber: function (testVar) {
                    if (angular.isNumber(testVar))
                        return true;
                    return false;
                },
                isArray: function (testVar) {
                    if (angular.isArray(testVar))
                        return true;
                    return false;
                },
                isObject: function (testVar) {
                    if (angular.isObject(testVar))
                        return true;
                    return false;
                },
                isValid: function (testVar) {
                    if (angular.isDefined(testVar) && testVar)
                        return true;
                    return false;
                }
            }
        });
})(window.angular);