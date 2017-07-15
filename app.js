if(angular.isDefined(angular)){
    angular
    .module('testApp', ['hlTableModule'])
    .config(function(hlTableConfigProvider){
        hlTableConfigProvider.setTemplatePath('dist/templates/');
    })
    .controller('testCtrl', function($rootScope, $scope, $timeout, $log, hlUrlHelper, hlTableConfig, hlDataHelper){
        $scope.config = {
            // Define a unique name
            name: 'test',
            // URL to get data
            url: 'data/basic.php',
            // Params: pageNum = 1, offset = 20, orderBy = '', ascDesc = 'ASC'
            params: {
                
            }
        };

        $scope.columns = [
            {
                field: 'id',
                label: 'ID',
                order: 1,
                canHide: false,
                textAlign: 'right',
                width: '10%',
                classes: 'id abc'
            }, {
                field: 'name',
                label: 'Name',
                order: 3,
                textAlign: 'left',
                canSort: false
            }, {
                field: 'published',
                label: 'Published',
                order: 2,
                textAlign: 'left',
                width: '10%'
            }
        ];

        // Run list
        hlDataHelper.run($scope.config, 'id');
    });
}