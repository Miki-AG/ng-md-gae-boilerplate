angular.module('project')
    .controller('MyPatternsCtrl', function($scope, Project, $http, UsedTagsResource, AuthFactory) {
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $scope.patterns = Project.query();
        $scope.usedTags = UsedTagsResource.query();
    })
