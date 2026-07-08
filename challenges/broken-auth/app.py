import base64
import hashlib
import hmac
import json
import secrets

from flask import Flask, jsonify, render_template_string, request

app = Flask(__name__)
SECRET = secrets.token_hex(32)
FLAG = "flag{alg_none_is_a_lie}"


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def issue_token(header: dict, payload: dict) -> str:
    h = b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{h}.{p}".encode()
    sig = hmac.new(SECRET.encode(), signing_input, hashlib.sha256).digest()
    return f"{h}.{p}.{b64url_encode(sig)}"


def verify_token(token: str):
    try:
        h_b64, p_b64, s_b64 = token.split(".")
        header = json.loads(b64url_decode(h_b64))
        payload = json.loads(b64url_decode(p_b64))
    except Exception:
        return None

    alg = header.get("alg")

    # Vulnerable: trusts the algorithm the token itself claims. A token with
    # alg "none" skips signature verification entirely.
    if alg == "none":
        return payload

    if alg == "HS256":
        expected_sig = hmac.new(SECRET.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()
        if hmac.compare_digest(b64url_encode(expected_sig), s_b64):
            return payload

    return None


LOGIN_PAGE = """
<!doctype html>
<title>Staff Dashboard &mdash; Login</title>
<body style="font-family: sans-serif; max-width: 480px; margin: 80px auto;">
  <h2>Staff Dashboard</h2>
  <form method="POST">
    <input name="username" placeholder="username"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <input name="password" placeholder="password" type="password"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <button type="submit">Log in</button>
  </form>
  <p style="color:#666; font-size: 0.9em;">Demo account: <code>guest</code> / <code>guest123</code></p>
  {% if error %}<p style="color:red;">{{ error }}</p>{% endif %}
  {% if token %}
    <p>Your token (send it as <code>Authorization: Bearer &lt;token&gt;</code> to
       <code>/admin</code>):</p>
    <textarea readonly style="width:100%; height:80px;">{{ token }}</textarea>
  {% endif %}
</body>
"""


@app.route("/", methods=["GET", "POST"])
def login():
    token = None
    error = None
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if username == "guest" and password == "guest123":
            token = issue_token({"alg": "HS256", "typ": "JWT"}, {"sub": "guest", "role": "user"})
        else:
            error = "Invalid credentials"
    return render_template_string(LOGIN_PAGE, token=token, error=error)


@app.route("/admin")
def admin():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else request.args.get("token", "")

    payload = verify_token(token)
    if not payload:
        return jsonify(error="missing or invalid token"), 401
    if payload.get("role") != "admin":
        return jsonify(error="forbidden: admin role required", your_role=payload.get("role")), 403

    return jsonify(flag=FLAG)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
