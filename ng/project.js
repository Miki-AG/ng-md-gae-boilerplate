angular.module('project', ['datastore', 'ngMaterial', 'ngRoute', 'ngMdIcons'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'ListCtrl',
                templateUrl: 'ng/list.html'
            })
            .when('/edit/:projectId', {
                controller: 'EditCtrl',
                templateUrl: 'ng/detail.html'
            })
            .when('/new', {
                controller: 'CreateCtrl',
                templateUrl: 'ng/detail.html'
            })
            .otherwise({ redirectTo: '/' });
    })
    .controller('ListCtrl', function($scope, Project, $http) {
        $http.get( 'ng/Tags/data.json').success(function(data) {
            $scope.garmentFamilies = data;
        });
        $scope.projects = Project.query();
    })
    .controller('CreateCtrl', function($scope, $location, Project) {
        $scope.save = function() {
            Project.save($scope.project, function(project) {
                $location.path('/');
            });
        }
    })
    .controller('EditCtrl', function($scope, $location, $routeParams, Project, UploadResource, $http) {
        $scope.upload_url = UploadResource.query();
        $scope.link_url = '';

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
        $scope.uploadFile = function(event) {
            console.log('uploadFile');
            var files = event.target.files;
            var file = files[0];

            var fd = new FormData();

            fd.append('file', file);
            $http.post($scope.upload_url[0].upload_url, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                            //'Content-Type': 'multipart/form-data'
                    }
                })
                .success(function(data) {
                    console.log('success');
                    $scope.link_url = data.url;
                })
                .error(function(data, status) {
                    console.log('error');
                });
        }
    })
    .directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    })
    .controller('myCtrl', function($scope) {
        $scope.uploadFile = function(event) {
            var files = event.target.files;
        };
    });
