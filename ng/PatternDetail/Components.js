angular.module('project')
    .controller('ViewCtrl', function($scope, $location, $stateParams, Project, UploadResource, DownloadResource, $http, $mdDialog) {

        $scope.link_url = '';
        $scope.garmentsReady = false;
        $scope.garmentTypes = [];
        $scope.fileName = '';
        $scope.pattern = null;

        $scope.init = function() {
            Project.get({ id: $stateParams.projectId }, function(pattern) {
                $scope.pattern = pattern;
                $scope.download_files_urls = DownloadResource.query({ id: $scope.pattern.id }, function(promisedData) {});
            });
        }
        $scope.destroy = function() {
            $scope.pattern.destroy(function() {
                $location.path('/');
            });
        };
        $scope.onpenPopup = function(item) {
            console.log(item.blob_key);

            $mdDialog.show({
                    locals: {
                        item: item
                    },
                    controller: 'DialogController',
                    templateUrl: 'ng/PatternDetail/image-dialog.tpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        $scope.init();
    })
    .controller('DialogController', function($scope, $mdDialog, item) {
        $scope.item = item;

        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    })
    .controller('EditCtrl', function($scope, $timeout, $location, $stateParams, Project, UploadResource, DownloadResource, $http) {
        $scope._DownloadResource = DownloadResource;

        $scope.upload_url = UploadResource.query();

        $scope.link_url = '';
        $scope.garmentsReady = false;
        $scope.garmentTypes = [];
        $scope.fileName = '';
        $scope.step = 0;
        $scope.steps = ['Describe your pattern', 'Upload files']

        $scope.families = [];
        $scope.garmentFamilies = [];
        $scope.garmentSelected;

        $scope.pattern = null;

        $scope.init = function() {
            $http.get('ng/Tags/data.json').success(function(data) {
                $scope.garmentFamilies = data;
                data.forEach(function(item) {
                    $scope.families.push(item.familyName);
                })
            });
            if (!$stateParams.projectId) {
                $scope.pattern = new Project();
            } else {
                Project.get({ id: $stateParams.projectId }, function(pattern) {
                    $scope.download_files_urls = DownloadResource.query({ id: pattern.id }, function(promisedData) {});
                    $scope.pattern = pattern;
                    if ($scope.pattern.garment_family) {
                        $scope.firstSelectionMade();
                    }
                });
            }
        }
        $scope.firstSelectionMade = function() {
            $scope.garmentTypes = [];
            $scope.garmentFamilies.forEach(function(family) {
                if ($scope.pattern.garment_family == family.familyName) {
                    family.garments.forEach(function(garment) {
                        $scope.garmentTypes.push(garment.fields.name)
                    });
                }
            });
            $scope.garmentsReady = true;
        }
        $scope.destroy = function() {
            $scope.pattern.destroy(function() {
                $location.path('/');
            });
        };
        $scope.goToStep = function(nextStep) {
            if ($scope.step == 0) {
                $scope.pattern = $scope.pattern.update(function() {});
            }
            $scope.step = nextStep;
        };
        $scope.uploadFile = function(event) {
            var files = event.target.files;
            var file = files[0];
            $scope.fileName = file.name;

            var data = new FormData();
            data.append('file', file);
            data.append('id', $scope.pattern.id);
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
                    $scope.link_url = data.url;
                    $timeout(function() {
                        $scope.download_files_urls = DownloadResource.query({ id: $scope.pattern.id }, function(promisedData) {});
                        $scope.upload_url = UploadResource.query();
                    }, 1000);
                })
                .error(function(data, status) {});
        }
        $scope.init();
    });
