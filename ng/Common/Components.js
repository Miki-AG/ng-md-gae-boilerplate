angular.module('project')
    .constant('CONFIG', {
        'LOGIN': 0,
        'REGISTER': 1,
        'LOGOUT': 1
    })
    .filter("filterIsImage", function() {
        return function(dates, month) {
            return dates.filter(function(item) {
                return item.indexOf(month) > -1;
            });
        };
    })
    .filter("isImage", function() {
        return function(filename) {
            var ext = filename.split('.').pop();
            if (ext.match(/(jpg|jpeg|png|gif)$/i)) {
                return true
            } else {
                return false
            };
        };
    })
    .filter('html_to_plain_text', function() {
        return function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    })
    .directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    });
