from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5501"])
CORS(app, origins=["http://127.0.0.1:5501", "http://localhost:5501"])


USERS = {}
VOCAB = {}
SESSIONS = {}

def analyze_text(text: str):
    tips = []
    words = text.split()
    if len(words) < 6:
        tips.append("Gapni kengayting: ko‘proq detal va bir-ikki qo‘shimcha jumla qo‘shing.")
    if any(w.endswith("ing") for w in words):
        tips.append("Gerund (ing) ishlatilgan — kontekst mosligiga e’tibor bering.")
    if not any(x in text for x in ["I am", "I'm", "He is", "She is", "They are"]):
        tips.append("To be (am/is/are) fe’lini to‘g‘ri qo‘llashni tekshiring.")
    if not tips:
        tips.append("Jumlalar tartibli — davom eting.")
    return {"tokens": len(words), "suggestions": tips}

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "status": "healthy"})

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not all([name, email, password]):
        return jsonify({"ok": False, "error": "Ma'lumotlar to‘liq emas"}), 400
    if email in USERS:
        return jsonify({"ok": False, "error": "Email band"}), 409
    USERS[email] = {"name": name, "password": password}
    VOCAB[email] = []
    token = f"token-{len(SESSIONS)+1}"
    SESSIONS[token] = email
    return jsonify({"ok": True, "token": token, "user": {"name": name, "email": email}})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    user = USERS.get(email)
    if not user or user["password"] != password:
        return jsonify({"ok": False, "error": "Email/parol noto‘g‘ri"}), 401
    token = f"token-{len(SESSIONS)+1}"
    SESSIONS[token] = email
    return jsonify({"ok": True, "token": token, "user": {"name": user["name"], "email": email}})

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_text = data.get("text", "").strip()
    if not user_text:
        return jsonify({"ok": False, "error": "Matn bo‘sh"}), 400
    analysis = analyze_text(user_text)
    reply = f"Siz aytdingiz: “{user_text}”. Maslahat: {analysis['suggestions'][0]}"
    return jsonify({"ok": True, "reply": reply, "analysis": analysis})

@app.route("/api/vocab/add", methods=["POST"])
def vocab_add():
    data = request.get_json(force=True)
    token = data.get("token")
    word = data.get("word", "").strip()
    example = data.get("example", "").strip()
    email = SESSIONS.get(token)
    if not email:
        return jsonify({"ok": False, "error": "Avtorizatsiya kerak"}), 401
    if not word:
        return jsonify({"ok": False, "error": "So‘z bo‘sh"}), 400
    VOCAB[email].append({"word": word, "example": example})
    return jsonify({"ok": True, "message": "So‘z qo‘shildi", "count": len(VOCAB[email])})

@app.route("/api/vocab/list", methods=["GET"])
def vocab_list():
    token = request.args.get("token")
    email = SESSIONS.get(token)
    if not email:
        return jsonify({"ok": False, "error": "Avtorizatsiya kerak"}), 401
    return jsonify({"ok": True, "items": VOCAB[email]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
