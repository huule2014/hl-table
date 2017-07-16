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
                }
            };

            // Define column collection
            $scope.columns = [
                {
                    field: 'id',
                    label: 'ID',
                    canHide: false,
                    textAlign: 'right',
                    width: '6%',
                    classes: 'id abc'
                }, {
                    field: 'name',
                    label: 'Name',
                    canSort: false
                }, {
                    field: 'published',
                    label: 'Published',
                    width: '10%'
                }, {
                    label: 'Action',
                    width: '6%',
                    textAlign: 'center',
                    canSort: false
                }
            ];

            // Process config data
            hlDataHelper.run($scope.config, 'id');
        });
}