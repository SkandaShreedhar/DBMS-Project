from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from flask_cors import CORS
from dotenv import load_dotenv
from flask_mysql_connector import MySQL
import os
import jwt
import datetime
import json
import psycopg2

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DATABASE'] = os.getenv('MYSQL_DATABASE')
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST')
# app.config['MYSQL_UNIX_SOCKET'] = '/tmp/mysql.sock' # bro, u r on windows right... remove this line and try 

# DATABASE_URL = os.getenv("POSTGRES_URL")

conn = None

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

mysql = MySQL(app)

socketio = SocketIO(app,cors_allowed_origins="*")

def getcursor():
    # connection = conn.get_db_connection()
    # return connection.cursor()
    return mysql.connection.cursor()

def db_commit(con):
    con.connection.commit()
    # con.commit()

@app.route('/test_db')
def test_db():
    cursor = getcursor()
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

    cursor = getcursor()
    cursor.execute("SELECT * FROM Users WHERE UserName = %s AND Password = %s", (phoneNumber, password))
    user = cursor.fetchone()
    cursor.close()

    if user:
        print(user)
        payload = {
            'userid': user[0],
            'phone_number': phoneNumber,  # You can include more user-specific data here
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)  # Token expires in 1 hour
        }

        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

        return jsonify({
            "status": "OK",
            "message": "Login successful",
            "token": token,
            "username": user[1]
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

    cursor = getcursor()
    cursor.execute("SELECT * FROM Users WHERE UserName = %s", (phoneNumber,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"status": "error", "message": "User already exists"}), 409

    # Insert new user into the database
    cursor.execute("INSERT INTO Users (UserName, Password) VALUES (%s, %s)", (phoneNumber, password))
    db_commit(mysql)

    cursor.close()

    cursor = getcursor()
    cursor.execute("SELECT MAX(UserID) FROM Users")
    userid = cursor.fetchone()[0]
    cursor.close()

    print(f"Userid is {userid}")
    cursor = getcursor()
    cursor.execute("CALL AddAuditLog('User signed up', %s);", (userid,))
    db_commit(mysql)

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

        return jsonify({
            "status": "error",
            "message": "Invalid token"
        }), 401

    UserName = data.get("phone_number")
    cursor = getcursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserName = %s", (UserName,))
    UserID = cursor.fetchone()[0]
    cursor.close()

    # cursor = getcursor()
    # cursor.execute("SELECT * FROM Chats WHERE UserId1 = %s OR UserId2 = %s", (UserID, UserID))
    
    cursor = getcursor()
    cursor.execute("""
    WITH UserCTE AS (
        SELECT UserID FROM Users WHERE UserName = %s
    )
    SELECT * FROM Chats 
    WHERE UserId1 = (SELECT UserID FROM UserCTE) 
    OR UserId2 = (SELECT UserID FROM UserCTE)
""", (UserName,))

    
    chats = cursor.fetchall()

    

    cursor.close()

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
        cursor = getcursor()
        cursor.execute("SELECT UserName FROM Users WHERE UserID = %s", (userid,))
        username = cursor.fetchone()
        otherUsernames.append(username)
        cursor.close()

    return {
        "message": "OK",
        "otherUserIDS": otherUserIDS,
        "otherUsernames": otherUsernames
    }

@app.route("/addnewchat", methods=["POST"])
def addnewchat():
    data = request.get_json()
    token = data.get("token")
    OtherUserName = data.get("username")

    try:
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms = ["HS256"])
    except Exception as e:
        print(e)

        return jsonify({
            "status": "error",
            "message": "Invalid token"
        }), 401

    UserName = data.get("phone_number")
    cursor = getcursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserName = %s", (UserName,))
    UserID = int(cursor.fetchone()[0])

    cursor = getcursor()
    cursor.execute("SELECT UserID FROM Users WHERE UserName = %s", (OtherUserName,))
    OtherUserID = int(cursor.fetchone()[0])
   
    if (UserID > OtherUserID):
        UserID, OtherUserID = OtherUserID, UserID

    print(UserID, OtherUserID)

    cursor = getcursor()
    cursor.execute("SELECT MAX(ChatId) FROM Chats")
    newChatId = cursor.fetchone()[0]

    if (newChatId == None):
        newChatId = 1
    else:
        newChatId += 1

    cursor = getcursor()
    cursor.execute("INSERT INTO Chats (ChatId, UserId1, UserId2) VALUES (%s, %s, %s)", (newChatId, UserID, OtherUserID))
    db_commit(mysql)

    return {
        "message": "OK"
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

    cursor = getcursor()
    cursor.execute(
        "SELECT UserID FROM Users WHERE UserName = %s",
        (username,)
    )
    user_id = cursor.fetchone()[0]

    cursor.close()


    # Fetch sent messages
    cursor = getcursor()
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

    all_messages = received_messages + sent_messages

    # Sort based on the absolute value of the second element
    all_messages_sorted = sorted(all_messages, key=lambda x: abs(x[1]))

    # Return conversation data
    return {
        "message": "OK",
        "allmessages": all_messages_sorted
    }

@app.route("/deleteuser", methods=["POST"])
def deleteuser():
    data = request.get_json()
    token = data.get('token')

    try:
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        print(e)
        return {"message": "Check your token please"}, 401
    
    username = data.get('phone_number')

    cursor = getcursor()
    cursor.execute("SELECT userid FROM users WHERE username = %s;", (username,))
    user_id = cursor.fetchone()[0]

    delete_commands = [
        # Delete from messages table where SenderID is the user_id
        "DELETE FROM messages WHERE senderid = %s;",
        
        # Delete from chats table where UserID1 is the user_id
        "DELETE FROM chats WHERE userid1 = %s;",
        
        # Delete from chats table where UserID2 is the user_id
        "DELETE FROM chats WHERE userid2 = %s;",
        
        # Delete from auditlogs table where UserID is the user_id
        "DELETE FROM auditlogs WHERE userid = %s;",
        
        # Delete from messages table where ReceiverID is the user_id
        "DELETE FROM messages WHERE receiverid = %s;",
        
        # Finally, delete from users table where UserID is the user_id
        "DELETE FROM users WHERE userid = %s;"
    ]
    
    # Executing each command with the dynamic user_id
    for command in delete_commands:
        cursor = getcursor()
        cursor.execute(command, (user_id,))
        cursor.close()

# Handle WebSocket connections
@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('response', {'data': 'Connection successful'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

rooms = set()

@socketio.on('join')
def on_join(payload):
    data = json.loads(payload)

    user_data = None
    token = data.get('token')

    recipient_user_id = int(data.get('recipient_user_id'))

    try:
        user_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        print(e)
        return {"message": "Check your token please"}, 401

    user_id = int(user_data.get('userid'))

    if (user_id > recipient_user_id):
        user_id, recipient_user_id = recipient_user_id, user_id

    # exit from all the rooms
    for room in rooms:
        leave_room(room)

    # join the room 
    room_id = str(user_id) + "_" + str(recipient_user_id)
    join_room(room_id)
    rooms.add(room_id)

@socketio.on('message')
def handle_message(data):
    data = json.loads(data)

    token = data.get('token')
    recipient_user_id = int(data.get('recipient_user_id'))
    message = data.get('message')
    user_data = None

    try:
        user_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        print(e)
        return {"message": "Check your token please"}, 401
    
    user_id = int(user_data.get('userid'))

    sender_id = user_id
    receiver_id = recipient_user_id

    if (user_id > recipient_user_id):
        user_id, recipient_user_id = recipient_user_id, user_id

    cursor = getcursor()
    cursor.execute(
        "INSERT INTO Messages (Message, SenderID, ReceiverID, MediaID) VALUES (%s, %s, %s, NULL)",
        (message, int(sender_id), int(receiver_id))
    )
    db_commit(mysql)
    cursor.close()

    cursor = getcursor()
    cursor.execute(
        "SELECT MAX(MessageID) FROM Messages WHERE SenderID = %s AND ReceiverID = %s",
        (sender_id, receiver_id)
    )

    id = cursor.fetchone()[0]
    cursor.close()
    print(id)

    room_id = str(user_id) + "_" + str(recipient_user_id)

    payload = json.dumps({
        "userid": -1 * id,
        "recipient_user_id": sender_id,
        "message": message
    })

    emit('message', payload, room=room_id, skip_sid=request.sid)    


@socketio.on('test')
def handle_message(data):
    print(f'Received message: {data}')
    emit('test', f'Message received: {data}', broadcast=True)

if __name__ == '__main__':
    # print("Attempting to connect to the database")
    # conn = psycopg2.connect(DATABASE_URL)
    # print("`Con`nection established")
    socketio.run(app, port=5000, debug=True)