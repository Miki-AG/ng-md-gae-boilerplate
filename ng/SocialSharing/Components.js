angular.module('project')
    .controller('SocialSharingController', function(
        $mdDialog,
        $mdToast,
        $rootScope,
        $scope,
        $timeout,
        CONFIG,
        exp
    ) {
        $scope.CONFIG = CONFIG;
        $scope.exp = exp;

        // Common attributes
        $scope.popupHeight = 300;
        $scope.popupWidth = 400;
        $scope.socialshareText = 'New: ' ;//+ exp.fields.name;
        //$scope.socialshareUrl = 'https://localhost:8080/ng#/preview/' + exp.fields.id;
        $scope.socialshareUrl = 'http://www.ssssssss.com//';
        $scope.socialshareHashtags = 'tags';

        $scope.expTitle = 'tt'//exp.fields.name;
        $scope.expDescription = 'dd';//exp.fields.description;

        // Linkedin specific
        $scope.linkedinSource = 'I sew what you did'

        $scope.init = function() {
            //console.log(exp.fields.id)
        };
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.connectFacebook = function() {
            console.log(dataToPass);
            $mdDialog.cancel();
        };

        $scope.init();
    });
