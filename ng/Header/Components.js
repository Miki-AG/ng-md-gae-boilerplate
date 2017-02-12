angular.module('project')
    .controller('HeaderCtrl', function($scope, $state, $firebaseAuth, $mdDialog) {
        $scope.state = $state;
        var auth = $firebaseAuth();
        $scope.loginEmail = function() {
            console.log('in login');
            auth.$signInWithPopup("facebook").then(function(firebaseUser) {
                console.log("Signed in as:", firebaseUser.user.uid);
            }).catch(function(error) {
                console.log("Authentication failed:", error);
            });
        }
        $scope.login = function(ev) {
            $mdDialog.show({
                    controller: 'HeaderCtrl',
                    templateUrl: 'ng/Header/login.tpl.html',
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
    })
