angular.module('project')
    .directive('tags', function() {
        return {
            restrict: 'E',
            templateUrl: 'ng/Tags/tags.tpl.html',
            controller: 'TagsController',
            controllerAs: 'tagsCtrl',
            bindToController: {
                tags: '=',
                tagTypeTitle: '='
            }
        }
    })
    .controller('TagsController', function($scope) {

    })
    .directive('tag', function() {
        return {
            restrict: 'E',
            templateUrl: 'ng/Tags/tag.tpl.html',
            controller: 'TagController',
            controllerAs: 'tagCtrl',
            bindToController: {
                tag: '='
            }
        }
    })
    .controller('TagController', function($scope, $rootScope) {
        $scope.goToTag = function(tagName) {
            $rootScope.$broadcast('get-patterns-by-tag', { tag: tagName });
        };
    });
