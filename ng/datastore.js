angular.module('datastore', ['ngResource'])
    .factory('Project', function($resource) {

        var Project = $resource(
            '/api/Project/:id', {}, {
                update: {
                    method: 'POST'
                }
            }
        );

        Project.prototype.update = function(cb) {
            return Project.update({ id: this.id },
                angular.extend({}, this, { _id: undefined }), cb);
        };

        Project.prototype.destroy = function(cb) {
            return Project.remove({ id: this.id }, cb);
        };

        return Project;
    })
    .factory('UploadResource', function($resource) {

        var Upload = $resource(
            '/api/Upload/:id', {}, {
                get: {
                    method: 'GET'
                }
            }
        );

        Upload.prototype.get = function(cb) {
            return Upload.get({}, cb);
        };
        return Upload;
    });
