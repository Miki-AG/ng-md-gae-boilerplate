angular.module('project')
    .controller('HomeCtrl', function($scope, Project, ProjectByTag, $http, UsedTagsResource, AuthFactory, $state) {
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

        $scope.$on('get-patterns', function(event, args) {
            $scope.patterns = Project.query();
        });

        $scope.$on('get-patterns-by-tag', function(event, args) {
            $scope.patterns = ProjectByTag.query({ tag: args.tag });
        });

        $scope.$on('get-patterns-by-criteria', function(event, args) {
            console.log('Going Home!')
            $scope.patterns = Project.query();
            $state.go('home');
        });
    })
