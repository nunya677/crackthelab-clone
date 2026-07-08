import secrets

from flask import Flask, redirect, render_template_string, request, session, url_for

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

# The admin's real password is random and never revealed — the point of this
# challenge is that the profile lookup below never checks it's actually you.
USERS = {
    1: {"username": "guest", "password": "guest123", "name": "Guest User", "bio": "Just here to poke around."},
    2: {
        "username": "admin",
        "password": secrets.token_hex(16),
        "name": "Site Admin",
        "bio": "flag{1d0r_1s_2_easy}",
    },
}

LOGIN_PAGE = """
<!doctype html>
<title>Staff Portal &mdash; Login</title>
<body style="font-family: sans-serif; max-width: 420px; margin: 80px auto;">
  <h2>Staff Portal</h2>
  <form method="POST">
    <input name="username" placeholder="username"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <input name="password" placeholder="password" type="password"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <button type="submit">Log in</button>
  </form>
  <p style="color:#666; font-size: 0.9em;">Demo account: <code>guest</code> / <code>guest123</code></p>
  {% if error %}<p style="color:red;">{{ error }}</p>{% endif %}
</body>
"""

PROFILE_PAGE = """
<!doctype html>
<title>Profile &mdash; {{ user.name }}</title>
<body style="font-family: sans-serif; max-width: 420px; margin: 80px auto;">
  <h2>{{ user.name }}</h2>
  <p><strong>Username:</strong> {{ user.username }}</p>
  <p><strong>Bio:</strong> {{ user.bio }}</p>
  <p><a href="/profile/{{ own_id }}">My profile</a> | <a href="/logout">Log out</a></p>
</body>
"""


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        for user_id, user in USERS.items():
            if user["username"] == username and user["password"] == password:
                session["user_id"] = user_id
                return redirect(url_for("profile", user_id=user_id))
        return render_template_string(LOGIN_PAGE, error="Invalid credentials")
    return render_template_string(LOGIN_PAGE, error=None)


@app.route("/profile/<int:user_id>")
def profile(user_id):
    if "user_id" not in session:
        return redirect(url_for("login"))

    # Vulnerable: any logged-in user can view any profile by ID — nothing
    # here checks that `user_id` matches `session["user_id"]`.
    user = USERS.get(user_id)
    if not user:
        return "No such profile", 404

    return render_template_string(PROFILE_PAGE, user=user, own_id=session["user_id"])


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
