angular.module('project')
    .directive('signUp', function() {
        return {
            restrict: 'E',
            controller: 'LoginButtonCtrl',
            templateUrl: 'ng/LoginButton/button.tpl.html',
            scope: {
                type: '='
            }
        }
    })
    .controller('LoginButtonCtrl', function($scope, $state, $mdDialog, CONFIG) {
        $scope.CONFIG = CONFIG;
        $scope.state = $state;

        $scope.pickLoginProviderDialog = function(type) {
            console.log(type);
            $mdDialog.show({
                locals: { typeOfDialog: type }, //here where we pass our data
                controller: 'LoginDialogCtrl',
                templateUrl: 'ng/LoginButton/login.tpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        }
    })
    .controller('LoginDialogCtrl', function($scope, $state, $firebaseAuth, $mdDialog, CONFIG, $mdToast, typeOfDialog) {
        $scope.CONFIG = CONFIG;
        $scope.state = $state;
        $scope.auth = $firebaseAuth();
        $scope.type = typeOfDialog;
        $scope.formData = {};

        $scope.pickLoginProviderDialog = function(type) {
            console.log(type);
            $mdDialog.show({
                controller: 'LoginCtrl',
                templateUrl: 'ng/LoginButton/login.tpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

        $scope.loginProvider = function(provider) {
            $scope.auth.$signInWithPopup(provider).then(function(firebaseUser) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Signed in using ' + provider)
                    .position('bottom left')
                    .hideDelay(3000)
                );
                $mdDialog.hide();
            }).catch(function(error) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Authentication failed: ' + error)
                    .position('bottom left')
                    .hideDelay(3000)
                );
            });
        }
        $scope.loginEmail = function() {
            $scope.auth.$signInWithEmailAndPassword(
                    $scope.formData.email,
                    $scope.formData.password)
                .then(function(firebaseUser) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Signed in')
                        .position('bottom left')
                    );
                    $mdDialog.hide();
                }).catch(function(error) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Authentication failed: ' + error)
                        .position('bottom left')
                        .hideDelay(3000)
                    );
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
        $scope.closeDialog = function() {
            $mdDialog.hide();
        }
    });
