import webapp2
import json
from google.appengine.ext import ndb
import logging
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

class Project(ndb.Model):
    name = ndb.StringProperty(required=True)
    site = ndb.StringProperty(required=False)
    description = ndb.StringProperty(required=True)

    def update(self, newdata):
        for key, value in newdata.items():
            setattr(self, key, value)

class UserPhoto(ndb.Model):
    blob_key = ndb.BlobKeyProperty()


class Rest(webapp2.RequestHandler):

    def post(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        data_dict = json.loads(self.request.body)
        tokens = self.request.path_info[1:].split('/')
        # Create
        if len(tokens) == 1:
            item = Project(
                name=data_dict['name'],
                description=data_dict['description']
            )
            key = item.put()
            self.response.write(json.dumps({'id': key.id()}))
        # Update
        elif len(tokens) == 2:
            item = Project.get_by_id(int(tokens[1]))
            item.name = data_dict['name']
            item.description = data_dict['description']
            item.put()

    def get(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        #forget about the leading '/' and searate the Data type and the ID
        split = self.request.path_info[1:].split('/')

        response = None
        if len(split) == 1:
            response = []
            # Get Upload URL
            if split[0] == 'Upload':
                url = blobstore.create_upload_url('/upload_photo')
                item_dict = {}
                item_dict['upload_url'] = url
                response.append(item_dict)
            # Get Download URL
            elif split[0] == 'Download':
                response = []
                for file in UserPhoto.query().fetch(20):
                    response.append({
                        'file': file.key.id()
                    })
            else:
                for item in globals()[split[0]].query():
                    item_dict = item.to_dict()
                    item_dict['id'] = item.key.id()
                    response.append(item_dict)
        else:
            #Convert the ID to an int, create a key and retrieve the object
            item = globals()[split[0]].get_by_id(int(split[1]))
            response = item.to_dict()
            response['id'] = item.key.id()

        self.response.write(json.dumps(response))

    def delete(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        #forget about the leading '/' and seperate the Data type and the ID
        split = self.request.path_info[1:].split('/')
        ndb.Key(split[0], int(split[1])).delete()

class PhotoUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            upload = self.get_uploads()[0]
            user_photo = UserPhoto(blob_key=upload.key())
            user_photo.put()
            self.response.write(json.dumps({'url':'/view_photo/%s' % upload.key()}))
        except:
            self.error(500)

class ViewPhotoHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, blob_key):

        logging.info('(Start)')
        """"
        <version>0.3.9</version>
        <unit>cm</unit>
        <author>Timo Virtaneva</author>
        <description>This trouser pattern is suitable for women and men for short and long trousers.
            There are 2 pleats possible.
            No back pockets.
        All needed parameters are in variable table.
        Check and adjust *** CHECK *** increments
        </description>

        <notes>The waist band is 2 parts to support adjustable back seam.
        Delete the unneeded layouts.
        Pockets are adjustable.</notes>

        <measurements>trousers.vit</measurements>
        """
        blob_reader = blobstore.BlobReader(blob_key)
        for line in blob_reader:
            if "<description>" in line:
                logging.info('>>> {}'.format(line))

        logging.info('(End)')
        if not blobstore.get(blob_key):
            self.error(404)
        else:
            self.send_blob(blob_key)

app = webapp2.WSGIApplication([
    ('/api.*', Rest),
    ('/upload_photo', PhotoUploadHandler),
    ('/view_photo/([^/]+)?', ViewPhotoHandler),
], debug=True)

