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
    })
    .factory('DownloadResource', function($resource) {

        var Download = $resource(
            '/api/Download/:id', {}, {
                get: {
                    method: 'GET'
                }
            }
        );

        Download.prototype.get = function(cb) {
            return Download.get({}, cb);
        };
        return Download;
    })
    .factory('UsedTagsResource', function($resource) {

        var UsedTags = $resource(
            '/api/UsedTags', {}, {
                get: {
                    method: 'GET'
                }
            }
        );

        UsedTags.prototype.get = function(cb) {
            return UsedTags.get({}, cb);
        };
        return UsedTags;
    });
