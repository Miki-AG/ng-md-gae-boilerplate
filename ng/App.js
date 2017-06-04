angular.module('project', ['datastore', 'ngMaterial', 'ngMdIcons', 'ui.router', 'firebase'])
    .config(function($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'ng/Home/home.html',
                controller: 'HomeCtrl'
            })
            .state('mypatterns', {
                url: '/mypatterns',
                templateUrl: 'ng/MyPatterns/my-patterns.tpl.html',
                controller: 'MyPatternsCtrl'
            })
            .state('creators', {
                url: '/creators',
                templateUrl: 'ng/StaticPages/creators.html',
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
    });
