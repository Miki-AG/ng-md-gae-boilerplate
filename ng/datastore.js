angular.module('datastore', ['ngResource'])
    .factory('Project', function($resource, AuthFactory, $http) {
        var auth = AuthFactory;
        var user = null;
        // any time auth state changes, add the user data to scope
        auth.$onAuthStateChanged(function(firebaseUser) {
            user = firebaseUser;
            if (user) {
                user.getToken().then(function(idToken) {
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + idToken
                });
            };
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
    .factory('ProjectByTag', function($resource) {
        var ProjectByTag = $resource(
            '/api/ProjectByTag/:id', {}, {
                get: {
                    method: 'GET'
                }
            }
        );
        return ProjectByTag;
    })
    .factory('ProjectByCriteria', function($resource) {
        var ProjectByCriteria = $resource(
            '/api/ProjectByCriteria/:id', {}, {
                get: {
                    method: 'GET'
                }
            }
        );
        return ProjectByCriteria;
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
        return Download;
    })
    .factory('RemoveFileResource', function($resource) {
        var Removed = $resource(
            '/api/RemoveFile/:id/:filename', { id: '@id', filename: '@filename' }, {
                get: {
                    method: 'GET'
                }
            }
        );
        return Removed;
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
