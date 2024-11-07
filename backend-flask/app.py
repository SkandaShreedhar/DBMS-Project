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
    cursor.execute("SELECT * FROM Users WHERE UserName = %s AND Password = %s", (phoneNumber, password))
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
    cursor.execute("SELECT * FROM Users WHERE UserName = %s", (phoneNumber,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"status": "error", "message": "User already exists"}), 409

    # Insert new user into the database
    cursor.execute("INSERT INTO Users (UserName, Password) VALUES (%s, %s)", (phoneNumber, password))
    mysql.connection.commit()

    cursor.close()

    return jsonify({"status": "OK", "message": "User created successfully"})

@app.route("/profile", methods=["GET"])
def fetch_profile_details():
    pass

@app.route("/profile", methods=["POST"])
def set_profile_details():
    pass

@app.route("/chats_and_groups", methods=["POST"])
def get_chat_and_groups():
    data = request.get_json()
    token = data.get("token")

    try:
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms = ["HS256"])
    except Exception as e:
        print(e)

        return {
            "message": "Check your token please"
        }

    UserName = data.get("phone_number")
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserName = %s", (UserName,))
    UserID = cursor.fetchone()[0]

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Chats WHERE UserId1 = %s OR UserId2 = %s", (UserID, UserID))
    chats = cursor.fetchall()

    otherUserIDS = []
    for chat in chats:
        other_userid = None
        if (chat[1] == UserID):
            other_userid = chat[2]
        else:
            other_userid = chat[1]

        otherUserIDS.append(other_userid)

    otherUsernames = []
    for userid in otherUserIDS:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT UserName FROM Users WHERE UserID = %s", (userid,))
        username = cursor.fetchone()
        otherUsernames.append(username)

    return {
        "message": "OK",
        "otherUserIDS": otherUserIDS,
        "otherUsernames": otherUsernames
    }

@app.route("/chat", methods=["POST"])
def create_chat():
    pass

@app.route("/group", methods=["POST"])
def create_group():
    pass

@app.route("/conversation", methods=["POST"])
def get_conversation():
    data = request.get_json()
    token = data.get("token")

    try:
        user_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        print(e)
        return {"message": "Check your token please"}, 401

    # Get user ID from decoded token data
    username = user_data.get("phone_number")  # Modify based on your data structure

    # Get recipient user ID from request data (assuming it's sent in the request)
    recipient_user_id = data.get("recipient_user_id")

    # Validate request parameters
    if not username or not recipient_user_id:
        return {"message": "Missing required parameters"}, 400

    cursor = mysql.connection.cursor()
    cursor.execute(
        "SELECT UserID FROM Users WHERE UserName = %s",
        (username,)
    )
    user_id = cursor.fetchone()[0]


    # Fetch sent messages
    cursor = mysql.connection.cursor()
    cursor.execute(
        "SELECT Message, MessageID FROM messages WHERE SenderID = %s AND ReceiverID = %s",
        (user_id, recipient_user_id),
    )
    sent_messages = cursor.fetchall()
    sent_messages_list = [message for message in sent_messages]  # Extract messages

    # Fetch received messages
    cursor.execute(
        "SELECT Message,-1 *  MessageID FROM messages WHERE SenderID = %s AND ReceiverID = %s",
        (recipient_user_id, user_id),
    )
    received_messages = cursor.fetchall()
    received_messages_list = [message for message in received_messages]  # Extract messages

    cursor.close()

    # Return conversation data
    return {
        "message": "OK",
        "sent_messages": sent_messages_list,
        "received_messages": received_messages_list,
    }


# Handle WebSocket connections
@socketio.on('message')
def handle_message(data):
    print(f'Received message: {data}')
    emit('response', f'Message received: {data}', broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)