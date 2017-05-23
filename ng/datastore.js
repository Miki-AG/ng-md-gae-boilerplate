angular.module('datastore', ['ngResource'])
    .factory('Project', function($resource, AuthFactory) {
        var auth = AuthFactory;
        var user = null;
        // any time auth state changes, add the user data to scope
        auth.$onAuthStateChanged(function(firebaseUser) {
            user = firebaseUser;
        });
        var Project = $resource(
            '/api/Project/:id', {}, {
                update: {
                    method: 'POST'
                }
            }
        );

        Project.prototype.update = function(cb) {
            this.owner = user.email;
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
            '/api/Download/:id', { id: '@id' }, {
                get: {
                    method: 'GET'
                }
            }
        );
        /*
                Download.prototype.get = function(cb) {
                    return Download.get({}, cb);
                };
                */
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
