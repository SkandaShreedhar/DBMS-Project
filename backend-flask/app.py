from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__, static_folder='client/build', static_url_path='/')
CORS(app)

socketio = SocketIO(app)

# Serve the React app
@app.route('/health', methods=["GET"])
def serve_react_app():
    return {
        "status": "alive"
    }

@app.route("/login", methods=["POST"])
def login():
    pass

@app.route("/signup", methods=["POST"])
def signup():
    pass

@app.route("/profile", methods=["GET"])
def fetch_profile_details():
    pass

@app.route("/profile", methods=["POST"])
def set_profile_details():
    pass

@app.route("/chats_and_groups", methods=["GET"])
def get_chat_and_groups():
    pass

@app.route("/chat", methods=["POST"])
def create_chat():
    pass

@app.route("/group", methods=["POST"])
def create_group():
    pass

@app.route("/conversation", methods=["GET"])
def get_conversation():
    pass

# Handle WebSocket connections
@socketio.on('message')
def handle_message(data):
    print(f'Received message: {data}')
    emit('response', f'Message received: {data}', broadcast=True)



if __name__ == '__main__':
    socketio.run(app, debug=True)
