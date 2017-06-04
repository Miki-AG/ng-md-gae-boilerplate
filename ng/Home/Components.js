angular.module('project')
    .controller('HomeCtrl', function($scope, Project, $http, UsedTagsResource, AuthFactory) {
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $http.get('ng/Tags/data.json').success(function(data) {
            $scope.garmentFamilies = data;
        });
        $scope.patterns = Project.query();
        $scope.usedTags = UsedTagsResource.query();
    })
