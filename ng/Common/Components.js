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
        });
