import secrets
import sqlite3

from flask import Flask, render_template_string, request

FLAG = "flag{sql1_1nj3ct10n_ftw}"
DB_PATH = "/tmp/app.db"

app = Flask(__name__)


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)")
    # The real password is random and never revealed anywhere — the point is
    # to bypass the check with an injection, not to guess or brute-force it.
    admin_password = secrets.token_hex(16)
    conn.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        ("admin", admin_password),
    )
    conn.commit()
    conn.close()


LOGIN_PAGE = """
<!doctype html>
<title>SQLi 101 &mdash; Staff Login</title>
<body style="font-family: sans-serif; max-width: 420px; margin: 80px auto;">
  <h2>Staff Login</h2>
  <form method="POST">
    <input name="username" placeholder="username"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <input name="password" placeholder="password" type="password"
           style="display:block; margin-bottom:8px; width:100%;"><br>
    <button type="submit">Log in</button>
  </form>
  {% if error %}<p style="color:red;">{{ error }}</p>{% endif %}
  {% if flag %}<p style="color:green;">Welcome back, admin. {{ flag }}</p>{% endif %}
</body>
"""


@app.route("/", methods=["GET", "POST"])
def login():
    error = None
    flag = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        # Intentionally vulnerable: raw string interpolation into SQL. This
        # is the bug the challenge exists to teach — do not "fix" it.
        query = (
            "SELECT id, username FROM users "
            f"WHERE username = '{username}' AND password = '{password}'"
        )

        conn = sqlite3.connect(DB_PATH)
        try:
            row = conn.execute(query).fetchone()
        except sqlite3.Error as exc:
            row = None
            error = f"Database error: {exc}"
        finally:
            conn.close()

        if row:
            flag = FLAG
        elif not error:
            error = "Invalid credentials"

    return render_template_string(LOGIN_PAGE, error=error, flag=flag)


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
