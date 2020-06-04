import os
import socket
from flask import Flask
from flask import request
from flask import jsonify
from urllib.parse import unquote
import logging

# Turn off logging to stdout
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Record local IP address
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
url = s.getsockname()[0] + ':5000/static/control.html'
s.close()

app = Flask(__name__)

@app.route('/')
def hello_world():
    print()
    return 'Hello, World!'

# Reveive key presses
@app.route('/start/<dir>')
def start(dir):
    if dir == 'forward':
        message = 'moving forward'
    elif dir == 'backward':
        message = 'moving backward'
    elif dir == 'left':
        message = 'turning left'
    elif dir == 'right':
        message = 'turning right'
    else:
        message = 'invalid direction'

    print('start ' + dir)
    return jsonify({ 'response': message })

# Receive key releases
@app.route('/stop/<dir>')
def stop(dir):
    if dir == 'forward':
        message = 'stopping'
    elif dir == 'backward':
        message = 'stopping'
    elif dir == 'left':
        message = 'stopping'
    elif dir == 'right':
        message = 'stopping'
    else:
        message = 'invalid direction'

    print('stop ' + dir)
    return jsonify({ 'response': message })

# Receive text commands
@app.route('/command/<string>')
def command(string):
    string = unquote(string)
    print(string)
    return jsonify({ "command" : string })

print()
print('----------------------------------------------')
print('Starting AlexaDrone Server')
print('Enter this url in a web browser:')
print(url)
print('----------------------------------------------')
print()

app.run(host= '0.0.0.0', port=5000)
