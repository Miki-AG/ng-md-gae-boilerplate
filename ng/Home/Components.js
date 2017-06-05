angular.module('project')
    .controller('HomeCtrl', function($scope, Project, ProjectByTag, ProjectByCriteria, $http, UsedTagsResource, AuthFactory, $state) {
        $scope.auth = AuthFactory;

        $scope.searchByCriteria = function() {
            if ($scope.search) {
                $scope.patterns = ProjectByCriteria.query({ criteria: $scope.search });
            }
        };
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
        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            $scope.user = firebaseUser;
        });
        $http.get('ng/Tags/data.json').success(function(data) {
            $scope.garmentFamilies = data;
        });
        $scope.patterns = Project.query();
        $scope.usedTags = UsedTagsResource.query();

        $scope.$on('get-patterns', function(event, args) {
            $scope.patterns = Project.query();
        });

        $scope.$on('get-patterns-by-tag', function(event, args) {
            $scope.patterns = ProjectByTag.query({ tag: args.tag });
        });
    })
