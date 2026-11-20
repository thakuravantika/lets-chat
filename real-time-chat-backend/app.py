from flask_socketio import SocketIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import re
import jwt
from datetime import datetime, timezone
import os 
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

if not app.config["SECRET_KEY"]:
    raise RuntimeError("SECRET_KEY is missing")
client = MongoClient("mongodb://localhost:27017/")

db = client["chat_app"]
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

connected_users = {}


db.users.update_many(
    {},
    {"$set": {"status": "offline"}}
)


def verify_socket_token(token):
    try:
        payload = jwt.decode(
            token,
            app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")

        if not user_id or not is_valid_object_id(user_id):
            return None
        user = db.users.find_one({"_id": ObjectId(user_id)})

        if not user:
            return None

        return user_id
    except jwt.InvalidTokenError:
        return None


def get_request_data():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None

def is_valid_object_id(user_id):
    return isinstance(user_id, str) and ObjectId.is_valid(user_id)

def clean_text(value):
    return value.strip() if isinstance(value, str) else ""




@socketio.on("connect")
def handle_connect(auth):
    token = auth.get("token") if auth else None

    user_id = verify_socket_token(token) if token else None

    if not user_id:
        print("Unauthorized connection rejected")
        return False

    connected_users[user_id] = request.sid

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": "online"}}
    )

    socketio.emit("user_status",{
        "userId": user_id,
        "status": "online"
    })
    print("Authenticated user connected:", user_id)




@socketio.on("disconnect")
def handle_disconnect():
    disconnected_user = None

    for user_id, socket_id in connected_users.items():
        if socket_id == request.sid:
            disconnected_user = user_id
            break

    if disconnected_user:
        del connected_users[disconnected_user]

        db.users.update_one(
            {"_id": ObjectId(disconnected_user)},
            {"$set": {"status": "offline"}}
        )
        socketio.emit("user_status",{
            "userId": disconnected_user,
            "status": "offline"
        })
        print("User disconnected:", disconnected_user)




@socketio.on("send_message")
def handle_send_message(data):

    if not isinstance(data, dict):
        return

    sender_id = None

    for user_id, socket_id in connected_users.items():
        if socket_id == request.sid:
            sender_id = user_id
            break

    if not sender_id:
        return

    receiver_id = data.get("receiverId")
    message_id = data.get("messageId")

    if not is_valid_object_id(receiver_id):
        return

    if not is_valid_object_id(message_id):
        return

    saved_message = db.messages.find_one({
        "_id": ObjectId(message_id),
        "senderId": ObjectId(sender_id),
        "receiverId": ObjectId(receiver_id)
    })

    if not saved_message:
        return

    created_at = saved_message.get("createdAt")

    if created_at:
        created_at = created_at.isoformat()
    else:
        created_at = None

    message_data = {
        "senderId": sender_id,
        "receiverId": receiver_id,
        "message": saved_message["message"],
        "createdAt": created_at
    }

    receiver_socket_id = connected_users.get(receiver_id)
    sender_socket_id = connected_users.get(sender_id)

    # Deliver message to receiver
    if receiver_socket_id:
        socketio.emit(
            "receive_message",
            message_data,
            to=receiver_socket_id
        )

    # Update sender's sidebar
    if sender_socket_id:
        socketio.emit(
            "sidebar_update",
            {
                "userId": receiver_id,
                "lastMessage": saved_message["message"],
                "lastMessageAt": created_at
            },
            to=sender_socket_id
        )

    # Update receiver's sidebar
    if receiver_socket_id:
        unread_count = db.messages.count_documents({
            "senderId": ObjectId(sender_id),
            "receiverId": ObjectId(receiver_id),
            "isRead": False
        })

        socketio.emit(
            "sidebar_update",
            {
                "userId": sender_id,
                "lastMessage": saved_message["message"],
                "lastMessageAt": created_at,
                "unreadCount": unread_count
            },
            to=receiver_socket_id
        )


@app.route("/")
def home():
    return "Real Time Chat Backend is running!"


@app.route("/register", methods=["POST"])
def register():
    data = get_request_data()

    if data is None:
        return jsonify({"message": "Invalid request data"}), 400

    name = clean_text(data.get("name"))
    email = clean_text(data.get("email"))
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if not isinstance(password, str) or not password.strip():
        return jsonify({"message": "Password cannot be empty"}), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"message": "Invalid email format"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"message": "Email already registered"}), 409

    user = {
        "name": name,
        "email": email,
        "passwordHash": generate_password_hash(password),
        "status": "offline"
    }

    db.users.insert_one(user)

    return jsonify({"message": "Registration successful"}), 201




@app.route("/login", methods=["POST"])
def login():
    data = get_request_data()

    if data is None:
        return jsonify({"message": "Invalid request data"}), 400

    email = clean_text(data.get("email"))
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if not isinstance(password, str) or not password.strip():
        return jsonify({"message": "Password cannot be empty"}), 400

    user = db.users.find_one({"email": email})

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if not check_password_hash(user["passwordHash"], password):
        return jsonify({"message": "Invalid email or password"}), 401

    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    return jsonify({"message": "Login successful",
                    "userId": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "token": token
    }),200





@app.route("/users", methods=["GET"])
def get_users():

    current_user_id = request.args.get("currentUserId")

    if not current_user_id:
        users = list(db.users.find({}, {"passwordHash": 0}))

        for user in users:
            user["_id"] = str(user["_id"])

        return jsonify(users), 200

    if not is_valid_object_id(current_user_id):
        return jsonify({"message": "Invalid user ID"}), 400

    current_user = db.users.find_one({
        "_id": ObjectId(current_user_id)
    })

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    users = list(db.users.find(
        {"_id": {"$ne": ObjectId(current_user_id)}},
        {"passwordHash": 0}
    ))

    for user in users:

        other_user_id = user["_id"]

        latest_message = db.messages.find_one(
            {
                "$or": [
                    {
                        "senderId": ObjectId(current_user_id),
                        "receiverId": other_user_id
                    },
                    {
                        "senderId": other_user_id,
                        "receiverId": ObjectId(current_user_id)
                    }
                ]
            },
            sort=[
                ("createdAt", -1),
                ("_id", -1)
            ]
        )

        user["_id"] = str(user["_id"])

        unread_count = db.messages.count_documents({
            "senderId": other_user_id,
            "receiverId": ObjectId(current_user_id),
            "isRead": False
        })

        user["unreadCount"] = unread_count

        if latest_message:
            user["lastMessage"] = latest_message.get("message", "")

            created_at = latest_message.get("createdAt")

            user["lastMessageAt"] = (
                created_at.isoformat() if created_at else None
            )
        else:
            user["lastMessage"] = ""
            user["lastMessageAt"] = None

    return jsonify(users), 200



@app.route("/messages", methods=["POST"])
def send_message():
    data = get_request_data()

    if data is None:
        return jsonify({"message": "Invalid request data"}), 400

    sender_id = data.get("senderId")
    receiver_id = data.get("receiverId")
    message_text = clean_text(data.get("message"))

    if not sender_id or not receiver_id or not message_text:
        return jsonify({"message": "All fields are required"}), 400

    if not isinstance(sender_id, str) or not isinstance(receiver_id, str):
        return jsonify({"message": "Invalid user ID"}), 400

    if not is_valid_object_id(sender_id) or not is_valid_object_id(receiver_id):
        return jsonify({"message": "Invalid user ID"}), 400

    sender = db.users.find_one({"_id": ObjectId(sender_id)})
    receiver = db.users.find_one({"_id": ObjectId(receiver_id)})

    if not sender or not receiver:
        return jsonify({"message": "User not found"}), 404

    created_at = datetime.now(timezone.utc)

    message = {
        "senderId": ObjectId(sender_id),
        "receiverId": ObjectId(receiver_id),
        "message": message_text,
        "createdAt": created_at,
        "isRead": False
    }

    result = db.messages.insert_one(message)

    return jsonify({
        "message": "Message sent successfully",
        "messageId": str(result.inserted_id),
        "createdAt": created_at.isoformat()
    }), 201






@app.route("/messages", methods=["GET"])
def get_messages():
    sender_id  = request.args.get("senderId")
    receiver_id = request.args.get("receiverId")

    if not sender_id or not receiver_id:
        return jsonify({"message": "Sender ID and Receiver ID are required"}), 400

    if not is_valid_object_id(sender_id) or not is_valid_object_id(receiver_id):
        return jsonify({"message": "Invalid user ID"}), 400

    messages = list(db.messages.find({
        "$or":[{
            "senderId": ObjectId(sender_id),
            "receiverId":   ObjectId(receiver_id)
        },
        {
            "senderId": ObjectId(receiver_id),
            "receiverId": ObjectId(sender_id)
        }
        ]
    }))
    for message in messages:
        message["_id"] = str(message["_id"])
        message["senderId"] = str(message["senderId"])
        message["receiverId"] = str(message["receiverId"])

        created_at = message.get("createdAt")

        message["createdAt"] = (
           created_at.isoformat() if created_at else None
        )

    return jsonify(messages), 200



@app.route("/messages/read", methods=["POST"])
def mark_messages_read():
    data = get_request_data()

    if data is None:
        return jsonify({"message": "Invalid request data"}), 400

    current_user_id = data.get("currentUserId")
    other_user_id = data.get("otherUserId")

    if not is_valid_object_id(current_user_id) or not is_valid_object_id(other_user_id):
        return jsonify({"message": "Invalid user ID"}), 400

    db.messages.update_many(
        {
            "senderId": ObjectId(other_user_id),
            "receiverId": ObjectId(current_user_id),
            "isRead": False
        },
        {
            "$set": {"isRead": True}
        }
    )
    current_socket_id = connected_users.get(current_user_id)

    if current_socket_id:
        socketio.emit(
            "sidebar_update",
            {
                "userId": other_user_id,
                "unreadCount": 0
            },
            to=current_socket_id
        )

    return jsonify({"message": "Messages marked as read"}), 200




print(client.admin.command("ping"))
if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)

