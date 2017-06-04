import webapp2
import json
from google.appengine.ext import ndb
import logging
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from collections import namedtuple


ACTIONS = namedtuple("ACTIONS", "UPLOAD DOWNLOAD USED_TAGS PATTERN PATTERN_BY_TAG")

URLS = ACTIONS(
    UPLOAD="Upload",
    DOWNLOAD="Download",
    USED_TAGS="UsedTags",
    PATTERN="Project",
    PATTERN_BY_TAG="ProjectByTag"
)

class Project(ndb.Model):
    "Pattern definition model"
    name = ndb.StringProperty(required=True)
    site = ndb.StringProperty(required=False)
    description = ndb.StringProperty(required=True)
    garment_family = ndb.StringProperty(required=False)
    garment_type = ndb.StringProperty(required=False)
    owner = ndb.StringProperty(required=False)
    def update(self, newdata):
        "Update pattern"
        for key, value in newdata.items():
            setattr(self, key, value)

class UserPhoto(ndb.Model):
    blob_key = ndb.BlobKeyProperty()
    pattern_key = ndb.KeyProperty(kind=Project)


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
                description=data_dict['description'],
                garment_family=data_dict['garment_family'],
                garment_type=data_dict['garment_type'],
                owner=data_dict['owner']
            )
            key = item.put()
            self.response.write(json.dumps({'id': key.id()}))
        # Update
        elif len(tokens) == 2:
            item = Project.get_by_id(int(tokens[1]))
            item.name = data_dict['name']
            item.description = data_dict['description']
            item.garment_family = data_dict['garment_family']
            item.garment_type = data_dict['garment_type']
            item.owner = data_dict['owner']
            item.put()

    def get(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        #forget about the leading '/' and searate the Data type and the ID
        split = self.request.path_info[1:].split('/')

        response = []
        if len(split) == 1:
            # Get Upload URL
            if split[0] == URLS.UPLOAD:
                url = blobstore.create_upload_url('/upload_photo')
                item = {}
                item['upload_url'] = url
                response.append(item)
            # Get Download URL
            elif split[0] == URLS.DOWNLOAD:
                for file in UserPhoto.query().fetch(20):
                    logging.info('-----------> {}'.format(file.key))
                    logging.info('-----------> {}'.format(file.blob_key))
                    logging.info('-----------> {}'.format(file.key.id()))

                    blob_info = blobstore.BlobInfo.get(file.blob_key)
                    logging.info('-----------> Filename: {}'.format(blob_info.filename))

                    response.append({
                        'id': file.key.id(),
                        'blob_key': str(file.blob_key),
                        'filename': blob_info.filename,
                        'extension': blob_info.filename.split(".")[-1]
                    })
            elif split[0] == URLS.USED_TAGS:
                for pattern in Project.query().order(Project.garment_family).order(Project.garment_type):
                    # Retrieve a family with this family name
                    familyToCreateOrAppend = next((f for f in response if f['familyName'] == pattern.garment_family), None)
                    # If family does not exists
                    if familyToCreateOrAppend is None:
                        # Create new family
                        familyToCreateOrAppend = {
                            "familyName": pattern.garment_family,
                            "garments": [{ "fields": {"name": pattern.garment_type }}]
                        }
                        response.append(familyToCreateOrAppend)
                    else:
                        if not any(t['fields']['name'] == pattern.garment_type for t in familyToCreateOrAppend['garments']):
                            familyToCreateOrAppend['garments'].append({ "fields": {"name": pattern.garment_type }})

            elif split[0] == URLS.PATTERN:
                owner = self.request.get('owner')
                query = Project.query()
                if owner:
                    query = Project.query(Project.owner == owner)
                for pattern in query.fetch(20):
                    response.append({
                        "description": pattern.description,
                        "site": pattern.site,
                        "id": pattern.key.id(),
                        "name": pattern.name,
                        "garment_family": pattern.garment_family,
                        "garment_type": pattern.garment_type,
                        "owner": pattern.owner
                    })
        elif split[0] == URLS.PATTERN_BY_TAG:
            logging.info('-----------> {} {}'.format('ProjectByTag', split[1]))
            query = Project.query(Project.garment_type == 'Coatdress')
            for pattern in query.fetch(20):
                response.append({
                    "description": pattern.description,
                    "site": pattern.site,
                    "id": pattern.key.id(),
                    "name": pattern.name,
                    "garment_family": pattern.garment_family,
                    "garment_type": pattern.garment_type,
                    "owner": pattern.owner
                })
        elif split[0] == URLS.DOWNLOAD:
            pattern_key_to_retrieve = split[1]
            logging.info('-----------> UPLOAD {} {}'.format(split[0], split[1]))
            response = []

            pattern = Project.get_by_id(int(pattern_key_to_retrieve))
            logging.info('-----------> pattern_key {} '.format(pattern.key))

            #files = UserPhoto.query(UserPhoto.pattern_key == pattern_key)
            files = UserPhoto.query(UserPhoto.pattern_key == pattern.key).fetch()
            for file in files:
                #for file in UserPhoto.query().fetch(20):
                logging.info('-----------> {}'.format(file.key))
                logging.info('-----------> {}'.format(file.blob_key))
                logging.info('-----------> {}'.format(file.key.id()))

                blob_info = blobstore.BlobInfo.get(file.blob_key)
                logging.info('-----------> Filename: {}'.format(blob_info.filename))

                response.append({
                    'id': file.key.id(),
                    'blob_key': str(file.blob_key),
                    'filename': blob_info.filename,
                    'extension': blob_info.filename.split(".")[-1]
                })
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
        upload = self.get_uploads()[0]

        logging.info('#######################################    UPLOAD self.request.body -->     ####################################')
        logging.info('[self.request.body]: {}'.format(self.request.body))
        logging.info('################################################################################################################')

        pattern_id = None
        body = self.request.body.split()
        iterator = iter(body)
        for word in iterator:
            if word == 'name="id"':
                pattern_id = next(iterator)
                logging.info('[body.next()]: {}'.format(pattern_id))

        logging.info('################################################################################################################')

        pattern = Project.get_by_id(int(pattern_id))

        user_photo = UserPhoto(blob_key=upload.key())
        user_photo.pattern_key = pattern.key
        user_photo.put()

        # now look into this: http://stackoverflow.com/questions/11195388/ndb-query-a-model-based-upon-keyproperty-instance
        self.response.write(json.dumps({'url':'/view_photo/%s' % upload.key()}))


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

