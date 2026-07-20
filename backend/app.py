from bson.objectid import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from groq import Groq
import os
from PyPDF2 import PdfReader
import fitz
from dotenv import load_dotenv
load_dotenv()



app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

CORS(app)

# ===============================
# MongoDB Configuration
# ===============================
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = client["ai_notes_vault"]
users_collection = db["users"]
notes_collection = db["notes"]



groq_api_key = os.getenv("GROQ_API_KEY")
client_ai = Groq(api_key=os.getenv("GROQ_API_KEY"))


def ai_summarize(text):
    response = client_ai.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You write clean, natural summaries."
            },
            {
                "role": "user",
                "content": f"""
                Write a single coherent paragraph summarizing the text below.

                Rules:
                - Do NOT use headings or labels
                - Do NOT include phrases like "Main Topic", "Key Points", or "Conclusion"
                - Do NOT use markdown, bullet points, or formatting
                - Write plain text only
                - Use simple, student-friendly language

                TEXT:
                {text}
                """
            }
        ],
        temperature=0.25
    )

    return response.choices[0].message.content.strip()




def ai_key_points(text):
    response = client_ai.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You extract concise key points."
            },
            {
                "role": "user",
                "content": f"""
                Extract exactly 4–5 concise key points from the text below.

                Rules:
                - Return ONLY the bullet points
                - Do NOT add introductions or explanations
                - Do NOT say "Here are the key points"
                - Each point must be a single sentence
                - Plain text only

                TEXT:
                {text}
                """
            }
        ],
        temperature=0.2
    )

    raw = response.choices[0].message.content.strip()

    points = []
    for line in raw.split("\n"):
        line = line.strip()
        if line:
            line = line.lstrip("-•1234567890. ").strip()
            points.append(line)

    return points






@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Backend running"})


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    password_hash = generate_password_hash(password)

    users_collection.insert_one({
        "username": username,
        "email": email,
        "password_hash": password_hash
    })

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"]
        }
    }), 200


@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json()

    user_id = data.get("user_id")
    title = data.get("title")
    content = data.get("content")
    tags = data.get("tags", [])

    if not user_id or not title or not content:
        return jsonify({"error": "Missing fields"}), 400

    summary_text = ""
    key_points = []

    try:
        summary_text = ai_summarize(content)
        key_points = ai_key_points(content)
    except Exception as e:
        print("Groq AI error:", e)

    notes_collection.insert_one({
        "user_id": user_id,
        "title": title,
        "content": content,
        "summary": summary_text,
        "key_points": key_points,
        "is_starred": False,
        "tags": tags
    })

    return jsonify({
        "message": "Note saved",
        "summary": summary_text,
        "key_points": key_points
    }), 201


@app.route("/api/notes/upload-pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    user_id = request.form.get("user_id")
    title = request.form.get("title")
    tags = request.form.getlist("tags")

    if not file or not user_id or not title:
        return jsonify({"error": "Missing fields"}), 400

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    # Extract text from PDF
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print("PDF read error:", e)
        return jsonify({"error": "Failed to read PDF"}), 500

    if len(text.strip()) < 50:
        return jsonify({"error": "PDF contains very little text"}), 400

    # AI summarization
    try:
        summary = ai_summarize(text)
        key_points = ai_key_points(text)
    except Exception as e:
        print("AI error:", e)
        summary = ""
        key_points = []

    notes_collection.insert_one({
        "user_id": user_id,
        "title": title,
        "content": text[:3000],  # store preview only
        "summary": summary,
        "key_points": key_points,
        "source": "pdf",
        "is_starred": False,
        "tags": tags
    })

    return jsonify({
        "message": "PDF uploaded and summarized successfully"
    }), 201




@app.route("/api/notes", methods=["GET"])
def get_notes():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    notes = []
    for note in notes_collection.find({"user_id": user_id}).sort(" _id", -1):
        notes.append({
    "id": str(note["_id"]),
    "title": note["title"],
    "content": note["content"],
    "summary": note.get("summary", ""),
    "key_points": note.get("key_points", []),
    "is_starred": note.get("is_starred", False),
    "tags": note.get("tags", [])
})


    return jsonify({"notes": notes}), 200

@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    try:
        notes_collection.delete_one({"_id": ObjectId(note_id)})
        return jsonify({"message": "Note deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/notes/<note_id>/toggle-star", methods=["POST"])
def toggle_star(note_id):
    note = notes_collection.find_one({"_id": ObjectId(note_id)})
    if not note:
        return jsonify({"error": "Note not found"}), 404

    new_value = not note.get("is_starred", False)

    notes_collection.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"is_starred": new_value}}
    )

    return jsonify({"is_starred": new_value}), 200



# ===============================
# Run Server
# ===============================
if __name__ == "__main__":
    app.run(port=5000, debug=True)
