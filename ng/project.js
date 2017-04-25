angular.module('project', ['datastore', 'ngMaterial', 'ngMdIcons', 'ui.router', 'firebase'])
    .config(function($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'ng/list.html',
                controller: 'ListCtrl'
            })
            .state('creators', {
                url: '/creators',
                templateUrl: 'ng/creators.html',
                controller: 'CreatorsCtrl'
            })
            .state('detail', {
                url: '/edit/{projectId:int}',
                templateUrl: 'ng/PatternDetail/detail.tpl.html',
                controller: 'EditCtrl'
            })
            .state('new', {
                url: '/new',
                templateUrl: 'ng/PatternDetail/detail.tpl.html',
                controller: 'EditCtrl'
            });
    })
    .controller('CreatorsCtrl', function($scope, $state) {
        $scope.state = $state;
    })
    .controller('ListCtrl', function($scope, Project, $http) {
        $http.get('ng/Tags/data.json').success(function(data) {
            $scope.garmentFamilies = data;
        });
        $scope.projects = Project.query();
    })
    .controller('EditCtrl', function($scope, $location, $stateParams, Project, UploadResource, DownloadResource, $http) {
        $scope.upload_url = UploadResource.query();
        $scope.download_files_urls = DownloadResource.query();
        $scope.link_url = '';
        $scope.garmentsReady = false;
        $scope.garmentTypes = [];
        $scope.fileName = '';
        $scope.step = 0;
        $scope.steps = ['Describe your pattern', 'Upload files', 'Share']


        $scope.families = [];
        $scope.garmentFamilies = [];
        $scope.garmentSelected;


        $scope.init = function() {
            $http.get('ng/Tags/data.json').success(function(data) {
                $scope.garmentFamilies = data;

                data.forEach(function(item) {
                    $scope.families.push(item.familyName);
                })
            });
            if (!$stateParams.projectId) {
                $scope.project = new Project();
            } else {
                Project.get({ id: $stateParams.projectId }, function(project) {
                    $scope.project = project;
                    if ($scope.project.garment_family) {
                        $scope.firstSelectionMade();
                    }
                });
            }
        }
        $scope.firstSelectionMade = function() {
            $scope.garmentTypes = [];
            $scope.garmentFamilies.forEach(function(family) {
                if ($scope.project.garment_family == family.familyName) {
                    family.garments.forEach(function(garment) {
                        $scope.garmentTypes.push(garment.fields.name)
                    });
                }
            });
            $scope.garmentsReady = true;
        }
        $scope.destroy = function() {
            $scope.project.destroy(function() {
                $location.path('/');
            });
        };
        $scope.goToStep = function(nextStep) {
            if ($scope.step == 0) {
                $scope.project.update(function() {});
            }
            $scope.step = nextStep;
        };
        $scope.uploadFile = function(event) {
            console.log('uploadFile');
            var files = event.target.files;
            var file = files[0];
            $scope.fileName = file.name;
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
        $scope.init();
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
