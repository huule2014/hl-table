/**
 * HL Table - Useful table directives for listing from server side
 * @version v0.0.1
 * @link https://github.com/huule2014/hl-table
 * @license MIT
 * @author Huu Le <huuptag@gmail.com>
 */
(function () {
    'use strict';
    var appPath = null, templatePath = null, language = 'en', tempLanguageData = {};

    // Define var name
    var loadingVar = '$dataLoading',
        listVar = '$dataList',
        totalRowsVar = '$totalRows',
        reloadFunctionName = '$reloadData',
        tableNameVar = '$tableName',
        selectAllVar = '$selectAll',
        selectedItemsVar = '$selectedItems',
        selectItemFunctionName = '$selectItem',
        allPrimaryKey = '$allPrimaryKey',
        dataSearchingVar = '$dataSearching',
        searchDataFunctionName = '$searchData';

    angular.module('hlTableModule', ['oc.lazyLoad', 'semantic-ui'])
        .config(function ($ocLazyLoadProvider) {
            $ocLazyLoadProvider.config({
                debug: false,
                events: false,
                modules: [
                    {
                        name: 'UIForm',
                        files: [
                            'bower_components/semantic-ui-form/form.min.css',
                            'bower_components/semantic-ui-form/form.min.js'
                        ],
                        serie: true,
                        cache: false
                    }
                ]
            });
        })
        .provider('hlTableConfig', function () {
            return {
                getAppPath: function () {
                    return appPath;
                },
                setLanguage: function (value) {
                    if (angular.isDefined(value)) {
                        language = value
                    } else {
                        $log.error('No language to set.');
                    }
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
                        templatePath: templatePath,
                        language: language,
                        limitToShow: 50
                    }
                }
            }
        })
        .run(function ($ocLazyLoad, hlTableConfig) {
            // Load default ocLazyLoad modules
            $ocLazyLoad.load('UIForm');
            $ocLazyLoad.load(hlTableConfig.templatePath + 'hl-table-custom.css');
        })
        .filter('hlTranslate', function ($http) {
            return function (str) {
                if (angular.isDefined(str) && str) {
                    if (!tempLanguageData) {

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
            return {
                generateID: function (tableName) {
                    if (angular.isDefined(tableName)) {
                        return 'hl-table-' + tableName;
                    } else {
                        return 'hl-table-' + this.makeID();
                    }
                },
                makeID: function (length) {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    if (angular.isUndefined(length) || length < 0) {
                        length = 28;
                    }

                    for (var i = 0; i < length; i++)
                        text += possible.charAt(Math.floor(Math.random() * possible.length));

                    return text;
                }
            }
        })
        .factory('hlDataHelper', function ($rootScope, $q, $timeout, $http, $log, hlElementHelper) {
            var reloadingData = [];

            return {
                run: function (config, primaryKey) {
                    if (angular.isDefined(config) && angular.isDefined(config.name)) {

                        /** Set select all status */
                        if (angular.isUndefined(config[selectAllVar])) {
                            config[selectAllVar] = false;
                        }

                        if (angular.isUndefined(config[dataSearchingVar])) {
                            config[dataSearchingVar] = false;
                        }

                        if (angular.isDefined(config.name)
                            && reloadingData.indexOf(config.name) == -1
                            && angular.isDefined(config.params)
                            && (angular.isUndefined(config[loadingVar]) || !config[loadingVar])) {
                            /** Push config name to reloadingData array */
                            reloadingData.push(config.name);

                            /** Set firstLoad status */
                            if (angular.isUndefined(config.params.firstLoad)) {
                                config.params.firstLoad = true;
                            }

                            /** Set default filter */
                            if (angular.isUndefined(config.params.search)) {
                                config.params.search = null;
                            }

                            /** Set table name */
                            if (angular.isUndefined(config[tableNameVar])) {
                                config[tableNameVar] = hlElementHelper.generateID(config.name);
                            }

                            /** Set selected items */
                            if (angular.isUndefined(config[selectedItemsVar])) {
                                config[selectedItemsVar] = [];
                            }

                            // DEFINED SOME FUNCTIONS
                            /**
                             * Select item
                             */
                            if (angular.isUndefined(config[selectItemFunctionName])) {
                                config[selectItemFunctionName] = function (hlDataId) {
                                    if (angular.isUndefined(config[selectedItemsVar])) {
                                        config[selectedItemsVar] = [];
                                    }

                                    if (config[selectedItemsVar].indexOf(hlDataId) == -1) {
                                        config[selectedItemsVar].push(hlDataId);
                                    } else {
                                        config[selectedItemsVar].splice(config[selectedItemsVar].indexOf(hlDataId), 1);
                                    }
                                };
                            }

                            /** Default params */
                            var defaultParams = {
                                offset: 25,
                                ascDesc: 'ASC'
                            };

                            angular.extend(config.params, defaultParams);

                            var reloadDataFunction = function (deferReturn) {
                                /** Set dataLoading status */
                                config[loadingVar] = true;

                                if (angular.isDefined(deferReturn)) {
                                    var defer = $q.defer();
                                } else {
                                    deferReturn = false;
                                }

                                $http({
                                    method: 'POST',
                                    url: config.url,
                                    data: config.params
                                }).then(function (response) {
                                        var result = response.data;

                                        // Set list
                                        if (angular.isDefined(result.dataList)) {
                                            config[listVar] = result.dataList;
                                            config[allPrimaryKey] = [];

                                            if (angular.isDefined(primaryKey) && angular.isArray(result.dataList) && result.dataList.length > 0) {
                                                angular.forEach(result.dataList, function (item) {
                                                    if (angular.isDefined(item[primaryKey]) && config[allPrimaryKey].indexOf(item[primaryKey]) == -1) {
                                                        config[allPrimaryKey].push(item[primaryKey]);
                                                    }
                                                });
                                            }
                                        }

                                        if (angular.isDefined(result.totalRows)) {
                                            config[totalRowsVar] = result.totalRows;
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

                                        if (deferReturn) {
                                            defer.resolve(result);
                                        }
                                    }, function (error) {
                                        if (deferReturn) {
                                            defer.reject(error);
                                        } else {
                                            $log.error(error);
                                        }
                                    })
                                    .finally(function () {
                                        /** Remove config name in reloadingData array */
                                        reloadingData.splice(reloadingData.indexOf(config.name), 1);

                                        /** Reset dataLoading to false */
                                        $timeout(function () {
                                            config[loadingVar] = false;
                                            config[dataSearchingVar] = false;
                                        }, 500);
                                    });

                                if (deferReturn) {
                                    return defer.promise;
                                }
                            };

                            // Init reload
                            reloadDataFunction(true);

                            // Define reload function
                            config[reloadFunctionName] = function () {
                                reloadDataFunction();
                            };

                            // Define search data function
                            config[searchDataFunctionName] = function () {
                                if (!config[dataSearchingVar]) {
                                    config.params.pageNum = 0;
                                    config[dataSearchingVar] = true;
                                    reloadDataFunction();
                                }
                            };

                        } else {
                            $log.error('[hlDataHelper] >> Invalid config.');
                        }
                    } else {
                        $log.error('[hlDataHelper] >> No config or name.');
                    }
                },
                sortField: function (config, field) {
                    if (field == config.params.orderBy) {
                        if (config.params.ascDesc == 'ASC') {
                            config.params.ascDesc = 'DESC';
                        } else {
                            config.params.ascDesc = 'ASC';
                        }
                    } else {
                        config.params.orderBy = field;
                        config.params.ascDesc = 'DESC';
                    }

                    config.$reloadData();
                }
            }
        })
        .directive('hlTable', function ($rootScope, $http, $timeout, hlTableConfig) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    columns: '=',
                    config: '=',
                    messages: '='
                },
                templateUrl: hlTableConfig.templatePath + 'table.tpl.html',
                link: function ($scope, $element, $attrs) {
                }
            }
        })
        .directive('hlTableHeader', function ($rootScope, $timeout, $log, hlTableConfig, hlDataHelper) {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    columns: '=',
                    config: '='
                },
                templateUrl: hlTableConfig.templatePath + 'header.tpl.html',
                link: function ($scope, $element, $attrs) {
                    $scope.sortField = function (field) {
                        hlDataHelper.sortField($scope.config, field);
                    };

                    $scope.$watch('config.$selectAll', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            if (newVal == true) {
                                $scope.config.$selectedItems = angular.copy($scope.config.$allPrimaryKey);
                            } else {
                                $scope.config.$selectedItems = [];
                            }
                        }
                    })
                }
            }
        })
        .directive('hlTableFooter', function ($rootScope, $timeout, $log, hlTableConfig, hlDataHelper) {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    columns: '=',
                    config: '='
                },
                templateUrl: hlTableConfig.templatePath + 'footer.tpl.html',
                link: function ($scope, $element, $attrs) {
                    angular.element($element).hide();

                    $scope.sortField = function (field) {
                        hlDataHelper.sortField($scope.config, field);
                    };

                    $scope.$watch('config.params.offset', function (newVal) {
                        if (angular.isDefined(hlTableConfig.limitToShow)) {
                            if (parseInt(newVal) >= hlTableConfig.limitToShow) {
                                angular.element($element).show();
                            } else {
                                angular.element($element).hide();
                            }
                        }
                    });
                }
            }
        })
        .directive('hlTableRow', function ($compile, $timeout, $log) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    primaryKey: '@'
                },
                template: '<tr ng-transclude></tr>',
                link: function ($scope, $element, $attrs) {
                    var allowedAttributes = ['id', 'class', 'style'];
                    angular.forEach(allowedAttributes, function (attr) {
                        if (angular.isDefined($attrs[attr]) && $attrs[attr]) {
                            element.attr(attr, $attrs[attr]);
                        }
                    });

                    if (angular.isDefined($scope.primaryKey)) {
                        var checkboxColumn = angular.element('<td width="40">' +
                            '<div class="ui checkbox">' +
                            '<input type="checkbox" ng-checked="config.$selectedItems.indexOf(item[\'' + $scope.primaryKey + '\']) > -1" ' +
                            'ng-click="config.$selectItem(item[\'' + $scope.primaryKey + '\'])" ' +
                            ' name="hl-row-check-box-{{item[\'' + $scope.primaryKey + '\']}}" >' +
                            '<label></label>' +
                            '</div>' +
                            '</td>');
                        angular.element($element).prepend(checkboxColumn);
                        $compile(checkboxColumn)($scope.$parent);
                    } else {
                        $log.error('[hlTableRow] >> No primary-key.');
                    }
                }
            }
        })
        .directive('hlTableCol', function ($timeout) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    textAlign: '@',
                    customClass: '@'
                },
                template: '<td ng-class="checkClass()" ng-transclude></td>',
                link: function ($scope, $element, $attrs) {
                    $scope.$watch(function () {
                        var columnIdx = angular.element($element).index();
                        var $th = angular.element($element).closest('table').find('th').eq(columnIdx);
                        return $th.is(":visible");
                    }, function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            if (newVal == true) {
                                angular.element($element).show();
                            } else {
                                angular.element($element).hide();
                            }
                        }
                    });

                    $timeout(function () {
                        var columnIdx = angular.element($element).index();
                        var $th = angular.element($element).closest('table').find('th').eq(columnIdx);
                        var textAlign = $th.attr('col-text-align');
                        var customClasses = $th.attr('col-custom-classes');
                        var currentClasses = angular.element($element).attr('class');
                        var allowedAlign = ['left', 'right', 'center'];
                        if (customClasses && allowedAlign.indexOf(textAlign) > -1) {
                            customClasses += ' ' + textAlign + ' aligned';
                        }

                        // Assign class
                        angular.element($element).attr('class', currentClasses + ' ' + customClasses);
                    });

                    if (angular.isDefined($attrs.colspan)) {
                        angular.element($element).attr('colspan', $attrs.colspan);
                    }

                    if (angular.isDefined($attrs.rowspan)) {
                        angular.element($element).attr('rowspan', $attrs.rowspan);
                    }
                }
            }
        })
        .directive('hlTableSetting', function ($rootScope, $timeout, $log, $document, hlTableConfig) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
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
                            {label: '25', value: 25},
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

                        $scope.$watch('config.params.offset', function (newVal, oldVal) {
                            if (newVal && !angular.equals(newVal, oldVal)) {
                                $scope.config.$reloadData();
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
                                    var tmp = {};
                                    angular.extend(tmp, defaultColumn, col);
                                    $scope.columns[idx] = tmp;
                                });
                            } else {
                                $log.error('[hlTableSetting] >> columns is undefined.');
                            }
                        }

                        /** First loading */
                        $scope.setupColumns();

                        $scope.toggleAll = function (status) {
                            if (angular.isDefined($scope.columns) && angular.isArray($scope.columns)) {
                                angular.forEach($scope.columns, function (col, idx) {
                                    if (angular.isDefined(col.canHide) && col.canHide == true) {
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
        .directive('hlTablePagination', function ($rootScope, $timeout, $window, hlTableConfig) {
            return {
                restrict: 'E',
                scope: {
                    config: '='
                },
                templateUrl: hlTableConfig.templatePath + 'pagination.tpl.html',
                link: function ($scope, element, attrs) {
                    $scope.$watch('config.' + totalRowsVar, function (newVal, oldVal) {
                        if (newVal && !angular.equals(newVal, oldVal)) {
                            $scope.config.params.pageNum = 0;
                            $scope.buildPagination();
                        }
                    });

                    $scope.fromRow = 0;
                    $scope.toRow = 0;
                    $scope.numLinks = 5;

                    $scope.buildPagination = function (reloadData) {
                        /**
                         * Fix pageNum greater than total rows
                         */
                        if ($scope.config.params.offset * $scope.config.params.pageNum > $scope.config.$totalRows) {
                            $scope.config.params.pageNum = 0;
                        }

                        $scope.pageLinks = [];
                        $scope.fromRow = 0;
                        $scope.toRow = 0;

                        if ($scope.config.$totalRows > 0) {
                            $scope.fromRow = ($scope.config.params.offset * $scope.config.params.pageNum) + 1;
                        } else {
                            $scope.fromRow = 0;
                        }

                        $scope.toRow = $scope.config.params.offset * ($scope.config.params.pageNum + 1);
                        //fix to_row if more than total rows
                        if ($scope.toRow > $scope.config.$totalRows) {
                            $scope.toRow = $scope.config.$totalRows;
                        }

                        if ($scope.config.$totalRows % $scope.config.params.offset > 0) {
                            $scope.pageLimit = (Math.floor($scope.config.$totalRows / $scope.config.params.offset)) + 1;
                        } else {
                            $scope.pageLimit = $scope.config.$totalRows / $scope.config.params.offset;
                        }

                        if ($scope.pageLimit <= $scope.numLinks) {
                            $scope.page_range = [1, $scope.pageLimit];
                        } else {
                            var pageMin = 0;
                            var pageMax = 0;

                            if ($scope.pageNum - Math.floor($scope.numLinks / 2) > 0) {
                                pageMin = $scope.pageNum - Math.floor($scope.numLinks / 2) + 1;
                            } else {
                                pageMin = 1;
                            }

                            if (pageMin == 1) {
                                pageMax = $scope.numLinks;
                            } else {
                                if ($scope.pageNum + Math.floor($scope.numLinks / 2) < $scope.pageLimit + 1) {
                                    pageMax = $scope.pageNum + Math.floor($scope.numLinks / 2) + 1;
                                    if (pageMax > $scope.pageLimit) {
                                        pageMin -= 1;
                                        pageMax -= 1;
                                    }
                                } else {
                                    pageMin = $scope.pageNum - Math.floor($scope.numLinks / 2) - ($scope.numLinks % 2);
                                    pageMax = $scope.pageLimit;
                                }
                            }

                            $scope.page_range = [pageMin, pageMax];
                        }

                        for (var i = $scope.page_range[0]; i < $scope.page_range[1] + 1; i++) {
                            $scope.pageLinks.push(i);
                        }

                        if ((angular.isDefined(reloadData) && reloadData)) {
                            //console.log('Pagination');
                            $scope.config.$reloadData();
                        }
                    };

                    $scope.goPage = function (pageNum) {
                        var reload = false;

                        if (pageNum < 0) {
                            pageNum = 0;
                        }

                        if (pageNum >= $scope.pageLimit) {
                            pageNum = $scope.pageLimit - 1;
                        }

                        if (pageNum != $scope.pageNum && pageNum >= 0 && pageNum <= $scope.pageLimit) {
                            reload = true;
                        }

                        if (reload) {
                            $scope.config.params.pageNum = pageNum;
                            $scope.buildPagination(true);
                        }
                    };

                    //pagasize handler
                    var offsetCounter = 0;
                    $scope.$watch("config.params.offset", function (newVal, oldVal) {
                        if (newVal == 25 && oldVal == 25) {
                            offsetCounter += 1;
                        }

                        if (newVal != oldVal) {

                            if (newVal == null) {
                                $scope.request.offset = 25;
                            }

                            $scope.config.params.pageNum = 0;

                            if (offsetCounter > 1) {
                                $scope.buildPagination(true);
                            } else {
                                $scope.buildPagination();
                            }
                        }

                        offsetCounter++
                    });
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
})
(window.angular);