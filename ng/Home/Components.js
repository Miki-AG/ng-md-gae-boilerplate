angular.module('project')
    .controller('HomeCtrl', function($scope, Project, ProjectByTag, ProjectByCriteria, $http, UsedTagsResource, AuthFactory, $state) {
        $scope.auth = AuthFactory;

        $scope.init = function() {
            console.log('at init!');
            // any time auth state changes, add the user data to scope
            $scope.auth.$onAuthStateChanged(function(firebaseUser) {
                $scope.user = firebaseUser;
            });

            $scope.$on('get-patterns', function(event, args) {
                console.log('get-patterns');
                $scope.patterns = Project.query();
            });

            $scope.$on('get-patterns-by-tag', function(event, args) {
                $scope.patterns = ProjectByTag.query({ tag: args.tag });
            });

            $http.get('ng/Tags/data.json').success(function(data) {
                $scope.garmentFamilies = data;
            });

            $scope.patterns = Project.query();
            $scope.usedTags = UsedTagsResource.query();
        };

        $scope.searchByCriteria = function() {
            if ($scope.search) {
                $scope.patterns = ProjectByCriteria.query({ criteria: $scope.search });
            }
        };
        $scope.init();
    })
