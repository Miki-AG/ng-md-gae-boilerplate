angular.module('project')
    .controller('HeaderCtrl', function($scope, $state, CONFIG, AuthFactory, $rootScope) {
        $scope.state = $state;
        $scope.CONFIG = CONFIG;
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $scope.refreshHome = function() {
            $rootScope.$broadcast('get-patterns');
        }
    });
