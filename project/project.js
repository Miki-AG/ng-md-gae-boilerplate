angular.module('project', ['datastore', 'ngMaterial', 'ngRoute', 'ngMdIcons'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'ListCtrl',
                templateUrl: 'project/list.html'
            })
            .when('/edit/:projectId', {
                controller: 'EditCtrl',
                templateUrl: 'project/detail.html'
            })
            .when('/new', {
                controller: 'CreateCtrl',
                templateUrl: 'project/detail.html'
            })
            .otherwise({ redirectTo: '/' });
    })
    .controller('ListCtrl', function($scope, Project) {
        $scope.projects = Project.query();
    })
    .controller('CreateCtrl', function($scope, $location, Project) {
        $scope.save = function() {
            Project.save($scope.project, function(project) {
                $location.path('/');
            });
        }
    })
    .controller('EditCtrl', function($scope, $location, $routeParams, Project, UploadResource) {
        $scope.upload_url = UploadResource.query();

        var self = this;
        Project.get({ id: $routeParams.projectId }, function(project) {
            self.original = project;
            $scope.project = new Project(self.original);
        });
        $scope.isClean = function() {
            return angular.equals(self.original, $scope.project);
        }
        $scope.destroy = function() {
            self.original.destroy(function() {
                $location.path('/list');
            });
        };
        $scope.save = function() {
            $scope.project.update(function() {
                $location.path('/');
            });
        };
    });
