angular.module('project')
    .factory("AuthFactory", ["$firebaseAuth",
        function($firebaseAuth) {
            return $firebaseAuth();
        }
    ])
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
    .controller('LoginButtonCtrl', function($scope, $state, $mdDialog, CONFIG, $mdToast, AuthFactory) {
        $scope.CONFIG = CONFIG;
        $scope.state = $state;
        $scope.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
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
        $scope.logout = function() {
            $scope.auth.$signOut();

            $mdToast.show(
                $mdToast.simple()
                .textContent('You\'ve been signed off')
                .position('bottom left')
                .hideDelay(3000)
            );
        }
    })
    .controller('LoginDialogCtrl', function($scope, $state, $firebaseAuth, $firebaseArray, $mdDialog, CONFIG, $mdToast, typeOfDialog) {
        $scope.CONFIG = CONFIG;
        $scope.state = $state;
        $scope.auth = $firebaseAuth();

        //var ref = firebase.database().ref();
        //var list = $firebaseArray(ref);

        $scope.type = typeOfDialog;
        $scope.formData = {};

        var ref = firebase.database().ref().child("users");
        // create a synchronized array
        $scope.users = $firebaseArray(ref);

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
                    .textContent('Welcome ' + firebaseUser.user.displayName + '!')
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
        $scope.loginOrRegisterEmail = function(type) {
            if (type == CONFIG.LOGIN) {
                $scope.loginEmail();
            } else {
                var errorMsg = $scope.validateRegisterForm();
                if (errorMsg == "") {
                    $scope.registerEmail();
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(errorMsg)
                        .position('bottom left')
                    );
                }
            }
        }
        $scope.validateRegisterForm = function() {
            if (typeof $scope.formData.email == "undefined") return "Please fill all fields!"
            if (typeof $scope.formData.username == "undefined") return "Please fill all fields!"
            if (typeof $scope.formData.password == "undefined") return "Please fill all fields!"
            if (typeof $scope.formData.passwordRepeat == "undefined") return "Please fill all fields!"
            if ($scope.formData.password != $scope.formData.passwordRepeat) return "Passwords must match!"
            if ($scope.formData.password.length < 5) return "Passwords too short!"
        }
        $scope.loginEmail = function() {
            try {
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
            } catch (e) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(e.message.replace('signInWithEmailAndPassword', 'Login'))
                    .position('bottom left')
                    .hideDelay(3000)
                );
            }
        }
        $scope.registerEmail = function() {
            $scope.auth.$createUserWithEmailAndPassword(
                    $scope.formData.email,
                    $scope.formData.password)
                .then(function(firebaseUser) {
                    $scope.users.$add({
                        email: $scope.formData.email,
                        displayName: $scope.formData.username
                    });
                    firebaseUser.updateProfile({
                        displayName: $scope.formData.username,
                    }).then(function() {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Welcome ' + $scope.formData.username + ', you are signed in')
                            .position('bottom left')
                        );
                    }, function(error) {

                    });
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

        $scope.closeDialog = function() {
            $mdDialog.hide();
        }
    });
