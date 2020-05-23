import os
import requests
import json
import zipfile


class AlexaRequest:
    BASEPATH = os.path.dirname(os.path.realpath(__file__))

    def __init__(self, url):
        self.url = url

    def get_images(self, imgname):
        query = { 'img': imgname }
        r = requests.get(self.url + "image", params=query)
        print(r)

        if r.status_code == 404:
            post_image(self.BASEPATH + imgname)
        elif r.status_code == 200:
            r.raw.decode_content = True
            with open(imgname, 'wb') as f:
                f.write(r.content)
            with zipfile.ZipFile(imgname, 'r') as zip_ref:
                zip_ref.extractall(self.BASEPATH)
        else:
            raise RuntimeError()

    def post_image(self, imagename, tag):
        data = { 'tag': tag }
        files = { 'image' : open(self.BASEPATH + '/' + imagename, 'rb') }

        r = requests.post(self.url + "image", files=files, data=data)
        print(r)

    def get_strings(self, key):
        query = { 'key': key }
        r = requests.get(self.url + "strings", params=query)
        try:
            json = r.json()
            return json["strings"]
        except:
            if r.status_code == 404:
                print("key not found")
            else:
                print("server error")

    def del_strings(self, key):
        query = { 'key' : key }
        r = requests.delete(self.url + "strings", params=query)

    def post_string(self, key, string):
        data = { "key" : key, "string" : string }
        requests.post(self.url + "strings", data)

def string_test(ar):
    # Send some example strings to server
    ar.post_string("sentences", "this is an example sentence")
    ar.post_string("sentences", "this is another example sentence")

    # Retreive and print strings
    strings = ar.get_strings("sentences")
    print(strings)

    # Delete the entries
    ar.del_strings("sentences")
    strings = ar.get_strings("sentences")
    print(strings)

def image_test(ar):
    ar.post_image("graph.png", "math")
    ar.get_images("math")

if (__name__ == "__main__"):
    print("running AlexaRequest example")

    # Example server url
    server_url = "http://10.0.0.194:5000/"

    # Create request instance
    ar = AlexaRequest(server_url)

    #string_test(ar)
    image_test(ar)
