import os
from flask import Flask
from flask import jsonify

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

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

    return jsonify({ 'response': message })

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

    return jsonify({ 'response': message })

@app.route('/command/<string>')
def command(string):
    return jsonify({ "command" : string })

app.run(host= '0.0.0.0', threaded=True)
