angular.module('project')
    .controller('HomeCtrl', function($scope, Project, ProjectByTag, $http, UsedTagsResource, AuthFactory) {
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

        $scope.$on('get-patterns-by-tag', function(event, args) {
            console.log(args.tag);
            $scope.patterns = ProjectByTag.query({ tag: args.tag });
        });
    })
