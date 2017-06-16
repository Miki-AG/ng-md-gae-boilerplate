import webapp2
import json
from google.appengine.ext import ndb
import logging
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from collections import namedtuple
from google.appengine.api import search


ACTIONS = namedtuple("ACTIONS", "UPLOAD DOWNLOAD USED_TAGS PATTERN PATTERN_BY_TAG PATTERN_BY_CRITERIA REMOVE_FILE")

URLS = ACTIONS(
    UPLOAD="Upload",
    DOWNLOAD="Download",
    USED_TAGS="UsedTags",
    PATTERN="Project",
    PATTERN_BY_TAG="ProjectByTag",
    PATTERN_BY_CRITERIA="ProjectByCriteria",
    REMOVE_FILE="RemoveFile"
)

class Project(ndb.Model):
    "Pattern definition model"
    name = ndb.StringProperty(required=True)
    site = ndb.StringProperty(required=False)
    description = ndb.StringProperty(required=True)
    garment_family = ndb.StringProperty(required=False)
    garment_type = ndb.StringProperty(required=False)
    owner = ndb.StringProperty(required=False)
    searchable_doc_id = ndb.StringProperty(required=False)
    def update(self, newdata):
        "Update pattern"
        for key, value in newdata.items():
            setattr(self, key, value)

class UserPhoto(ndb.Model):
    blob_key = ndb.BlobKeyProperty()
    pattern_key = ndb.KeyProperty(kind=Project)


class Rest(webapp2.RequestHandler):
    def create_pattern(self, data_dict, tokens):
        searchable_doc = search.Document(
            fields=[
               search.TextField(name='name', value=data_dict['name']),
               search.TextField(name='description', value=data_dict['description'])
            ])
        index = search.Index('patterns').put(searchable_doc)
        item = Project(
            name=data_dict['name'],
            description=data_dict['description'],
            garment_family=data_dict['garment_family'],
            garment_type=data_dict['garment_type'],
            owner=data_dict['owner'],
            searchable_doc_id=index[0].id
        )
        key = item.put()
        self.response.write(json.dumps({'id': key.id()}))

    def update_pattern(self, data_dict, tokens):
        item = Project.get_by_id(int(tokens[1]))
        item.name = data_dict['name']
        item.description = data_dict['description']
        item.garment_family = data_dict['garment_family']
        item.garment_type = data_dict['garment_type']
        item.owner = data_dict['owner']
        item.put()

        searchable_doc = search.Document(
            doc_id=item.searchable_doc_id,
            fields=[
                search.TextField(name='name', value=data_dict['name']),
                search.TextField(name='description', value=data_dict['description'])
            ])
        index = search.Index('patterns')
        index.put(searchable_doc)

    def get_upload_url(self):
        response = []

        url = blobstore.create_upload_url('/upload_photo')
        item = {}
        item['upload_url'] = url
        response.append(item)
        self.response.write(json.dumps(response))

    def get_download_url(self):
        response = []

        for file in UserPhoto.query().fetch(20):
            blob_info = blobstore.BlobInfo.get(file.blob_key)
            response.append({
                'id': file.key.id(),
                'blob_key': str(file.blob_key),
                'filename': blob_info.filename,
                'extension': blob_info.filename.split(".")[-1]
            })
        self.response.write(json.dumps(response))

    def get_used_tags_url(self):
        response = []

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
        self.response.write(json.dumps(response))

    def get_pattern(self, split):
        response = []

        #Convert the ID to an int, create a key and retrieve the object
        item = globals()[split[0]].get_by_id(int(split[1]))
        response = item.to_dict()
        response['id'] = item.key.id()
        self.response.write(json.dumps(response))

    def get_my_patterns(self):
        response = []

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
        self.response.write(json.dumps(response))

    def get_patterns_by_tag(self):
        response = []

        tag_name = self.request.get('tag')

        query = Project.query(Project.garment_type == tag_name)
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
        self.response.write(json.dumps(response))

    def get_patterns_by_criteria(self):
        response = []

        criteria = self.request.get('criteria')
        index = search.Index('patterns')
        results = index.search(criteria)
        search_results = []
        for scored_document in results:
            print(scored_document)
            search_results.append(Project.query(Project.searchable_doc_id == scored_document.doc_id))
        for item in search_results:
            pattern = item.fetch()[0]
            response.append({
                "description": pattern.description,
                "site": pattern.site,
                "id": pattern.key.id(),
                "name": pattern.name,
                "garment_family": pattern.garment_family,
                "garment_type": pattern.garment_type,
                "owner": pattern.owner
            })
        self.response.write(json.dumps(response))

    def get_files(self, split):
        response = []
        pattern_key_to_retrieve = split[1]
        pattern = Project.get_by_id(int(pattern_key_to_retrieve))
        files = UserPhoto.query(UserPhoto.pattern_key == pattern.key).fetch()
        for file in files:
            blob_info = blobstore.BlobInfo.get(file.blob_key)
            response.append({
                'id': file.key.id(),
                'blob_key': str(file.blob_key),
                'filename': blob_info.filename,
                'extension': blob_info.filename.split(".")[-1]
            })
        self.response.write(json.dumps(response))

    def remove_file(self, split):
        response = []
        pattern_key_to_retrieve = split[1]
        filename_to_remove = split[2]

        pattern = Project.get_by_id(int(pattern_key_to_retrieve))
        files = UserPhoto.query(UserPhoto.pattern_key == pattern.key).fetch()
        for file in files:
            blob_info = blobstore.BlobInfo.get(file.blob_key)
            if blob_info.filename == filename_to_remove:
                file.key.delete()
                response.append({
                    'result': 'success'
                })
            else:
                response.append({
                    'result': 'error'
                })
        self.response.write(json.dumps(response))

    def get(self):
        response = []

        #pop off the script name ('/api')
        self.request.path_info_pop()
        #forget about the leading '/' and searate the Data type and the ID
        split = self.request.path_info[1:].split('/')

        if len(split) == 1:
            if split[0] == URLS.UPLOAD:
                self.get_upload_url()

            elif split[0] == URLS.DOWNLOAD:
                self.get_download_url()

            elif split[0] == URLS.USED_TAGS:
                self.get_used_tags_url()

            elif split[0] == URLS.PATTERN:
                self.get_my_patterns()

            elif split[0] == URLS.PATTERN_BY_TAG:
                self.get_patterns_by_tag()

            elif split[0] == URLS.PATTERN_BY_CRITERIA:
                self.get_patterns_by_criteria()

        elif split[0] == URLS.DOWNLOAD:
            self.get_files(split)

        elif split[0] == URLS.REMOVE_FILE:
            self.remove_file(split)
        else:
            self.get_pattern(split)

    def post(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        data_dict = json.loads(self.request.body)
        tokens = self.request.path_info[1:].split('/')
        # Create
        if len(tokens) == 1:
            self.create_pattern(data_dict, tokens)

        # Update
        elif len(tokens) == 2:
            self.update_pattern(data_dict, tokens)

    def delete(self):
        #pop off the script name ('/api')
        self.request.path_info_pop()
        #forget about the leading '/' and seperate the Data type and the ID
        split = self.request.path_info[1:].split('/')
        ndb.Key(split[0], int(split[1])).delete()

class PhotoUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        upload = self.get_uploads()[0]
        pattern_id = None
        body = self.request.body.split()
        iterator = iter(body)
        for word in iterator:
            if word == 'name="id"':
                pattern_id = next(iterator)
                logging.info('[body.next()]: {}'.format(pattern_id))

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

