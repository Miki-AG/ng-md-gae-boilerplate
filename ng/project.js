angular.module('project', ['datastore', 'ngMaterial', 'ngMdIcons', 'ui.router', 'firebase'])
    .filter("isImage", function() {
        return function(filename) {
            var ext = filename.split('.').pop();
            if (ext.match(/(jpg|jpeg|png|gif)$/i)) {
                return true
            } else {
                return false
            };
        };
    })
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
            .state('view', {
                url: '/view/{projectId:int}',
                templateUrl: 'ng/PatternDetail/view.tpl.html',
                controller: 'ViewCtrl'
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
    .controller('ListCtrl', function($scope, Project, $http, UsedTagsResource, AuthFactory) {
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $http.get('ng/Tags/data.json').success(function(data) {
            $scope.garmentFamilies = data;
        });
        $scope.projects = Project.query();
        $scope.usedTags = UsedTagsResource.query();
    })
    .controller('ViewCtrl', function($scope, $location, $stateParams, Project, UploadResource, DownloadResource, $http) {
        $scope.upload_url = UploadResource.query();
        $scope.download_files_urls = DownloadResource.query();
        $scope.link_url = '';
        $scope.garmentsReady = false;
        $scope.garmentTypes = [];
        $scope.fileName = '';

        $scope.init = function() {
            if (!$stateParams.projectId) {
                $scope.project = new Project();
            } else {
                Project.get({ id: $stateParams.projectId }, function(project) {
                    $scope.project = project;
                });
            }
        }
        $scope.destroy = function() {
            $scope.project.destroy(function() {
                $location.path('/');
            });
        };
        $scope.init();
    })
    .controller('EditCtrl', function($scope, $timeout, $location, $stateParams, Project, UploadResource, DownloadResource, $http) {
        $scope._DownloadResource = DownloadResource;

        $scope.upload_url = UploadResource.query();
        $scope.download_files_urls = DownloadResource.query();
        $scope.link_url = '';
        $scope.garmentsReady = false;
        $scope.garmentTypes = [];
        $scope.fileName = '';
        $scope.step = 0;
        $scope.steps = ['Describe your pattern', 'Upload files']


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

            var data = new FormData();
            data.append('file', file);
            data.append('id', $stateParams.projectId);

            var config = {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                        //'Content-Type': 'application/x-www-form-urlencoded'
                        //'Content-Type': 'multipart/form-data'
                        //'Content-Type': 'multipart/related'
                }
            }
            $http.post(
                    $scope.upload_url[0].upload_url,
                    data,
                    config)
                .success(function(data) {
                    console.log('success');
                    $scope.link_url = data.url;
                    $timeout(function() {
                        $scope.download_files_urls = $scope._DownloadResource.query();
                        $scope.upload_url = UploadResource.query();
                    }, 1000);
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
