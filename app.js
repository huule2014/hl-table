if (angular.isDefined(angular)) {
    angular
        .module('testApp', ['hlTableModule'])
        .config(function (hlTableConfigProvider) {
            hlTableConfigProvider.setTemplatePath('dist/templates/');
        })
        .controller('testCtrl', function ($rootScope, $scope, $timeout, $log, hlUrlHelper, hlTableConfig, hlDataHelper) {
            $scope.config = {
                // Define a unique name
                name: 'test',
                // URL to get data
                url: 'data/basic.php',
                // Params: pageNum = 1, offset = 20, orderBy = '', ascDesc = 'ASC'
                params: {},
                advancedFilter: {
                    templatePath: 'myModule/advancedFilter.tpl.html'
                },
                // Bind for default prop
                $filter: {
                    published: '0'
                },
                tools: [
                    {
                        template: '<i class="plus icon"></i>',
                        type: 'icon',
                        callback: function (e) {
                            console.log(e);
                        }
                    }
                ]
            };

            // Define column collection
            $scope.columns = [
                {
                    field: 'id',
                    label: 'ID',
                    textAlign: 'right',
                    width: '6%',
                    display: false,
                    ordered: 3
                }, {
                    field: 'name',
                    label: 'Name',
                    ordered: 2
                }, {
                    field: 'published',
                    label: 'Published',
                    width: '10%',
                    textAlign: 'center',
                    ordered: 4
                }, {
                    field: 'action',
                    label: 'Action',
                    width: '6%',
                    textAlign: 'center',
                    canSort: false,
                    ordered: 1
                }
            ];

            // Process config data
            hlDataHelper.run($scope.config, 'id');
        });
}