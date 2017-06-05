angular.module('project')
    .directive('patternGrid', function() {
        return {
            restrict: 'E',
            templateUrl: 'ng/PatternGrid/pattern-grid.tpl.html',
            controller: 'PatternGridController',
            controllerAs: 'gridCtrl',
            bindToController: {
                patterns: '='
            }
        }
    })
    .controller('PatternGridController', function($scope, $state, CONFIG, AuthFactory, $rootScope) {
        $scope.getClass = function(family) {
            switch (family.toLowerCase()) {
                case "tops":
                    return 'family-tops';
                case "pants":
                    return 'family-pants';
                case "skirts":
                    return 'family-skirts';
                case "dresses":
                    return 'family-dresses';
                case "suits & uniforms":
                    return 'family-suits';
                case "outerwear":
                    return 'family-outerwear';
                case "underwear & lingerie":
                    return 'family-underwear';
                case "footwear":
                    return 'family-footwear';
                case "headwear":
                    return 'family-headwear';
                case "nightwear":
                    return 'family-nightwear';
                case "swimwear":
                    return 'family-swimwear';
                case "other (garment)":
                    return 'family-other-garment';
                case "other (not garment)":
                    return 'family-other-not-garment';
                default:
                    return 'family-img-default';
            }
        };
    });
