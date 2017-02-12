angular.module('project')
    .controller('HeaderCtrl', function($scope, $state, CONFIG) {
        $scope.state = $state;
        $scope.CONFIG = CONFIG;
    });
