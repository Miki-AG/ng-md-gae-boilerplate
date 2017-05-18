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
