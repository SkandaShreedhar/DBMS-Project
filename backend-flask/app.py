from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
from flask_mysql_connector import MySQL
import os
from flask_mysql_connector import MySQL
import jwt
import datetime

load_dotenv()

app = Flask(__name__, static_folder='client/build', static_url_path='/')
CORS(app)

app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DATABASE'] = os.getenv('MYSQL_DATABASE')
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST')
app.config['MYSQL_UNIX_SOCKET'] = '/tmp/mysql.sock' # bro, u r on windows right... remove this line and try 

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

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

@app.route("/signin", methods=["POST"])
def login():
    data = request.get_json()
    phoneNumber = data.get("phoneNumber")
    password = data.get("password")

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE phone_number = %s AND password = %s", (phoneNumber, password))
    user = cursor.fetchone()
    cursor.close()

    if user:
        payload = {
            'phone_number': phoneNumber,  # You can include more user-specific data here
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
        }

        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

        return jsonify({
            "status": "OK",
            "message": "Login successful",
            "token": token
        })
    else:
        return jsonify({
            "status": "error",
            "message": "Invalid phone number or password"
        }), 401
    
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    phoneNumber = data.get("phoneNumber")
    password = data.get("password")

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE phone_number = %s", (phoneNumber,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"status": "error", "message": "User already exists"}), 409

    # Insert new user into the database
    cursor.execute("INSERT INTO users (phone_number, password) VALUES (%s, %s)", (phoneNumber, password))
    mysql.connection.commit()

    cursor.close()

    return jsonify({"status": "OK", "message": "User created successfully"})

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