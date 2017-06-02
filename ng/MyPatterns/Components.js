angular.module('project')
    .controller('MyPatternsCtrl', function($scope, Project, $http, UsedTagsResource, AuthFactory) {
        $scope.auth = AuthFactory;
        $scope.noPatterns = false;
        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
            $scope.patterns = Project.query({ owner: $scope.user.email });

            $scope.patterns.$promise.then(function(result) {
                if ($scope.patterns.length == 0) {
                    $scope.noPatterns = true;
                }
            });
        });
        $scope.usedTags = UsedTagsResource.query();
    });
