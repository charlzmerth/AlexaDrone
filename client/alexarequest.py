import os
import requests
import json
import zipfile

url = "http://10.0.0.194:8080/"
basepath = os.path.dirname(os.path.realpath(__file__))

def get_image(imgname):
    query = {'img': imgname}
    r = requests.get(url + "image", params=query)

    if r.status_code == 404:
        post_image(basepath + imgname)
    elif r.status_code == 200:
        r.raw.decode_content = True
        with open(imgname, 'wb') as f:
            f.write(r.content)
        with zipfile.ZipFile(imgname, 'r') as zip_ref:
            zip_ref.extractall(basepath)
    else:
        raise RuntimeError()

def post_image(imgname):
    files = {imgname: open(basepath + '\\' + imgname, 'rb')}
    r = requests.post(url, files=files)

def get_strings(key):
    query = {'key': key}
    r = requests.get(url + "strings", params=query)
    json = r.json()
    return json["strings"]

def post_string(key, string):
    data = {"key" : key, "string" : string}
    requests.post(url + "strings", data)

if (__name__ == "main"):
    post_string("sentences", "this is an example sentence")
    post_string("sentences", "this is another example sentence")
    get_strings("sentences")
