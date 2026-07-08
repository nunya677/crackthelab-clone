import secrets

from flask import Flask, jsonify, make_response, render_template_string, request

app = Flask(__name__)
FLAG = "flag{cor5_credent1als_leak}"

# In-memory session store: token -> username. Deliberately simple, since the
# vulnerability this challenge teaches has nothing to do with session design.
SESSIONS: dict[str, str] = {}

LOGIN_PAGE = """
<!doctype html>
<title>Account &mdash; Login</title>
<body style="font-family: sans-serif; max-width: 480px; margin: 80px auto;">
  <h2>My Account</h2>
  <form method="POST">
    <input name="username" placeholder="username"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <input name="password" placeholder="password" type="password"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <button type="submit">Log in</button>
  </form>
  <p style="color:#666; font-size: 0.9em;">Demo account: <code>guest</code> / <code>guest123</code></p>
  {% if error %}<p style="color:red;">{{ error }}</p>{% endif %}
  {% if logged_in %}
    <p style="color:green;">Logged in. Your browser now holds a session cookie for this
       origin.</p>
    <p>Now check whether <code>/api/secret</code> actually restricts who can read it: replay the
       request with your cookie but a spoofed <code>Origin</code> header (curl works well for
       this, since it won't rewrite the header for you like a real browser's fetch API does) and
       see what the <code>Access-Control-Allow-Origin</code> / <code>-Allow-Credentials</code>
       response headers say.</p>
  {% endif %}
</body>
"""


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin:
        # Vulnerable: reflects whatever Origin the browser sends, and pairs
        # it with Allow-Credentials. That combination lets any third-party
        # site read this API's authenticated responses using a victim's own
        # cookies — the opposite of what CORS is supposed to prevent.
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.route("/", methods=["GET", "POST"])
def login():
    logged_in = False
    error = None
    resp_cookie = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if username == "guest" and password == "guest123":
            token = secrets.token_hex(16)
            SESSIONS[token] = username
            logged_in = True
            resp_cookie = token
        else:
            error = "Invalid credentials"

    resp = make_response(render_template_string(LOGIN_PAGE, error=error, logged_in=logged_in))
    if resp_cookie:
        resp.set_cookie("session_token", resp_cookie, httponly=True, samesite="None", secure=False)
    return resp


@app.route("/api/secret", methods=["GET", "OPTIONS"])
def secret():
    if request.method == "OPTIONS":
        return ("", 204)

    token = request.cookies.get("session_token")
    if token not in SESSIONS:
        return jsonify(error="not logged in"), 401

    return jsonify(flag=FLAG, user=SESSIONS[token])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
