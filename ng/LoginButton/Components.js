angular.module('project')
    .directive('signUp', function() {
        return {
            restrict: 'E',
            controller: 'LoginCtrl',
            templateUrl: 'ng/LoginButton/button.tpl.html',
            scope: {
                type: '='
            }
        }
    })
    .controller('LoginCtrl', function($scope, $state, $firebaseAuth, $mdDialog, CONFIG) {
        $scope.CONFIG = CONFIG;
        $scope.state = $state;
        var auth = $firebaseAuth();

        $scope.pickLoginProviderDialog = function(ev) {
            $mdDialog.show({
                    controller: 'HeaderCtrl',
                    templateUrl: 'ng/LoginButton/login.tpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        }

        $scope.loginEmail = function() {
            console.log('in login');
            auth.$signInWithPopup("facebook").then(function(firebaseUser) {
                console.log("Signed in as:", firebaseUser.user.uid);
            }).catch(function(error) {
                console.log("Authentication failed:", error);
            });
        }

        $scope.loginFacebook = function() {
            console.log('in login');
            auth.$signInWithPopup("facebook").then(function(firebaseUser) {
                console.log("Signed in as:", firebaseUser.user.uid);
            }).catch(function(error) {
                console.log("Authentication failed:", error);
            });
        }
        $scope.logout = function() {
            console.log('in login');
            auth.$signOut();

            var firebaseUser = auth.$getAuth();

            if (firebaseUser) {
                console.log("Signed in as:", firebaseUser.uid);
            } else {
                console.log("Signed out");
            }
        }
    });
