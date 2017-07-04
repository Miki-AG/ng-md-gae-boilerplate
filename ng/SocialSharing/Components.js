angular.module('project')
    .controller('SocialSharingController', function(
        $mdDialog,
        $mdToast,
        $rootScope,
        $scope,
        $timeout,
        CONFIG,
        pattern
    ) {
        $scope.CONFIG = CONFIG;
        $scope.pattern = pattern;
        $scope.LinkShareUrl = '/#/view/' + pattern.id + '/' + pattern.slug;
        $scope.socialshareUrl = 'http://www.isewwhatyoudid.com/share/' + pattern.id + '/' + pattern.slug;

        // Common attributes
        $scope.popupHeight = 300;
        $scope.popupWidth = 400;
        $scope.socialshareText = pattern.description;
        $scope.socialshareHashtags = 'tags';
        $scope.name = pattern.name;

        // Linkedin specific
        $scope.linkedinSource = pattern.name;

        $scope.init = function() {
            console.log(pattern)
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
