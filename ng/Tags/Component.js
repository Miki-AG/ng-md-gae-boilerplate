angular.module('UgeApp')
    .directive('tags', function(CONFIG) {
        return {
            restrict: 'E',
            templateUrl: CONFIG.STATIC_URL + 'ng/Tags/tags.tpl.html',
            controller: 'TagsController',
            controllerAs: 'tagsCtrl',
            bindToController: {
                tags: '=',
                tagTypeTitle: '='
            }
        }
    })
    .controller('TagsController', function() {
    })
    .directive('tag', function(CONFIG) {
        return {
            restrict: 'E',
            templateUrl: CONFIG.STATIC_URL + 'ng/Tags/tag.tpl.html',
            controller: 'TagController',
            controllerAs: 'tagCtrl',
            bindToController: {
                tag: '='
            }
        }
    })
    .controller('TagController', function() {
    });
