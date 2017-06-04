angular.module('project')
    .controller('CreatorsCtrl', function($scope, $state, AuthFactory, $mdToast) {
        $scope.state = $state;
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $scope.goToNew = function() {
            if ($scope.user) {
                $state.go('new');
            } else {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Please, login or register to upload patterns!')
                    .position('bottom left')
                    .hideDelay(3000)
                );
            }
        }
    })
