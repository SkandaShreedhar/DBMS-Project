from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
from flask_mysql_connector import MySQL
import os
from flask_mysql_connector import MySQL

load_dotenv()

app = Flask(__name__, static_folder='client/build', static_url_path='/')
CORS(app)

app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DATABASE'] = os.getenv('MYSQL_DATABASE')
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST')
app.config['MYSQL_UNIX_SOCKET'] = '/tmp/mysql.sock' # bro, u r on windows right... remove this line and try 

mysql = MySQL(app)

socketio = SocketIO(app)

app = Flask(__name__, static_folder='client/build', static_url_path='/')
CORS(app)

@app.route('/test_db')
def test_db():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DATABASE();")
    db_name = cursor.fetchone()
    cursor.close()
    return f"Connected to database: {db_name}"

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