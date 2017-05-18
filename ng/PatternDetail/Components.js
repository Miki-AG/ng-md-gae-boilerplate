angular.module('project')
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
        $scope.onpenPopup = function(item) {
            console.log(item.blob_key);
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
    });
