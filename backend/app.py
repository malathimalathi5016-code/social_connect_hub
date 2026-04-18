import datetime
import math
import os
from flask import Flask, jsonify, redirect, request, send_from_directory, session, g
from werkzeug.security import check_password_hash, generate_password_hash

USE_MYSQL = bool(os.environ.get('MYSQL_HOST'))
if USE_MYSQL:
    import pymysql
    DB_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
    DB_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    DB_USER = os.environ.get('MYSQL_USER', 'root')
    DB_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    DB_NAME = os.environ.get('MYSQL_DB', 'social_connect_hub')
else:
    import sqlite3

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))
JS_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'js'))
DB_PATH = os.path.join(BASE_DIR, 'social_connect_hub.db')

app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'social_connect_hub_dev_secret')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False


def adapt_query(query):
    return query.replace('?', '%s') if USE_MYSQL else query


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        if USE_MYSQL:
            db = pymysql.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                db=DB_NAME,
                cursorclass=pymysql.cursors.DictCursor,
                charset='utf8mb4',
                autocommit=False,
            )
        else:
            db = sqlite3.connect(DB_PATH)
            db.row_factory = sqlite3.Row
        g._database = db
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def row_to_dict(row):
    data = dict(row)
    if 'profile_url' in data:
        data['profileUrl'] = data['profile_url']
    if 'collaboration_email' in data:
        data['collaborationEmail'] = data['collaboration_email']
    return data


def init_db():
    if USE_MYSQL:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4',
            autocommit=True,
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.execute(f"USE `{DB_NAME}`")
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                is_admin TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            '''
        )
    else:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                is_admin INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
            '''
        )
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS influencers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            followers INTEGER NOT NULL,
            promotions TEXT,
            profile_url TEXT,
            collaboration_email TEXT,
            created_at TEXT NOT NULL
        )
        '''
    )
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            influencer_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(user_email, influencer_id)
        )
        '''
    )

    admin_email = os.environ.get('ADMIN_EMAIL', 'admin.socialconnecthub@gmail.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
    if admin_email and admin_password:
        cursor.execute(adapt_query('SELECT id, is_admin FROM users WHERE email = ?'), (admin_email,))
        existing_admin = cursor.fetchone()
        if existing_admin:
            if (existing_admin.get('is_admin') if USE_MYSQL else existing_admin[1]) == 0:
                cursor.execute(
                    adapt_query('UPDATE users SET is_admin = 1, username = ? WHERE email = ?'),
                    ('Administrator', admin_email),
                )
        else:
            now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                adapt_query('INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)'),
                (
                    'Administrator',
                    admin_email,
                    generate_password_hash(admin_password),
                    1,
                    now,
                ),
            )

    cursor.execute(adapt_query('SELECT COUNT(*) FROM influencers'))
    count_row = cursor.fetchone()
    count_value = count_row['COUNT(*)'] if USE_MYSQL else count_row[0]
    if count_value == 0:
        now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        sample_influencers = [
            (
                'Samantha Styles',
                'Instagram',
                25400,
                'Fashion reviews, brand collaborations, lifestyle promotions',
                'https://instagram.com/samantha.styles',
                'samantha.styles@collab.com',
                now,
            ),
            (
                'Tech Trends',
                'YouTube',
                87000,
                'Unboxing, tech reviews, sponsored video ads',
                'https://youtube.com/TechTrends',
                'contact@techtrends.media',
                now,
            ),
            (
                'WanderWave',
                'Facebook',
                18300,
                'Travel content, destination promotions, event partnerships',
                'https://facebook.com/WanderWave',
                'connect@wanderwave.com',
                now,
            ),
        ]
        cursor.executemany(
            adapt_query('INSERT INTO influencers (name, platform, followers, promotions, profile_url, collaboration_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'),
            sample_influencers,
        )

    conn.commit()
    conn.close()


# Initialize the database before handling any requests.
init_db()


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(adapt_query('SELECT id FROM users WHERE email = ?'), (email,))
    existing = cursor.fetchone()
    if existing:
        return jsonify({'error': 'Email is already registered.'}), 400

    admin_email = os.environ.get('ADMIN_EMAIL', 'admin.socialconnecthub@gmail.com')
    if admin_email and email == admin_email:
        return jsonify({'error': 'This email is reserved for the administrator.'}), 400

    cursor.execute(
        adapt_query('INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)'),
        (username, email, generate_password_hash(password), 0, datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
    )
    conn.commit()
    return jsonify({'message': 'Registration successful. You can now login.'})


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(adapt_query('SELECT * FROM users WHERE email = ?'), (email,))
    user = cursor.fetchone()
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    user_data = {
        'username': user['username'],
        'email': user['email'],
        'is_admin': bool(user['is_admin']),
        'is_instagram_user': False,
    }
    session['user'] = user_data
    return jsonify({'message': 'Login successful.', 'user': user_data})


@app.route('/api/logout', methods=['POST'])
def logout_user():
    session.pop('user', None)
    session.pop('instagram_user', None)
    return jsonify({'message': 'Logout successful.'})


@app.route('/api/current-user', methods=['GET'])
def current_user():
    user = session.get('user')
    if user:
        return jsonify({'user': user})
    instagram_user = session.get('instagram_user')
    if instagram_user:
        return jsonify({'user': {
            'username': instagram_user['username'],
            'email': None,
            'is_admin': False,
            'is_instagram_user': True,
        }})
    return jsonify({'error': 'Not authenticated.'}), 401


@app.route('/api/influencers', methods=['GET', 'POST'])
def influencers():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        name = data.get('name', '').strip()
        platform = data.get('platform', '').strip()
        followers = data.get('followers')
        promotions = data.get('promotions', '').strip()
        profile_url = data.get('profileUrl') or data.get('profile_url') or ''
        collaboration_email = data.get('collaborationEmail') or data.get('collaboration_email') or ''

        if not name or not platform or followers is None:
            return jsonify({'error': 'Name, platform, and followers are required.'}), 400

        try:
            followers = int(followers)
        except (TypeError, ValueError):
            return jsonify({'error': 'Followers must be a number.'}), 400

        cursor.execute(
            adapt_query('INSERT INTO influencers (name, platform, followers, promotions, profile_url, collaboration_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'),
            (name, platform, followers, promotions, profile_url, collaboration_email, datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
        )
        conn.commit()
        return jsonify({'message': 'Influencer uploaded successfully.'})

    cursor.execute(adapt_query('SELECT * FROM influencers ORDER BY followers DESC'))
    rows = cursor.fetchall()
    influencers_list = [row_to_dict(row) for row in rows]
    return jsonify(influencers_list)


@app.route('/api/search')
def search_influencers():
    conn = get_db()
    q = (request.args.get('q') or '').strip().lower()
    platform = (request.args.get('platform') or '').strip().lower()
    min_followers = int(request.args.get('min_followers') or 0)
    per_page = max(1, min(100, int(request.args.get('per_page') or 20)))
    page = max(1, int(request.args.get('page') or 1))

    cursor = conn.cursor()
    where_clauses = ['followers >= ?']
    params = [min_followers]

    if platform and platform != 'all':
        where_clauses.append('LOWER(platform) = ?')
        params.append(platform)

    if q:
        search_term = f'%{q}%'
        where_clauses.append('(LOWER(name) LIKE ? OR LOWER(promotions) LIKE ?)')
        params.extend([search_term, search_term])

    where_clause = ' AND '.join(where_clauses)
    count_query = f'SELECT COUNT(*) as total FROM influencers WHERE {where_clause}'
    cursor.execute(adapt_query(count_query), params)
    total = cursor.fetchone()['total']

    offset = (page - 1) * per_page
    query = f'SELECT * FROM influencers WHERE {where_clause} ORDER BY followers DESC LIMIT ? OFFSET ?'
    search_params = params + [per_page, offset]
    cursor.execute(adapt_query(query), search_params)
    rows = cursor.fetchall()
    influencers_list = [row_to_dict(row) for row in rows]

    return jsonify({
        'influencers': influencers_list,
        'total': total,
        'per_page': per_page,
        'page': page,
        'total_pages': math.ceil(total / per_page) if total else 1,
    })


@app.route('/api/favorites/<email>', methods=['GET', 'POST'])
def favorites(email):
    email = (email or '').strip().lower()
    if not email or email == 'null':
        return jsonify([])

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        name = data.get('name', '').strip()
        platform = data.get('platform', '').strip()

        if not name or not platform:
            return jsonify({'error': 'Influencer name and platform are required.'}), 400

        cursor.execute(
            adapt_query('SELECT id FROM influencers WHERE LOWER(name) = ? AND LOWER(platform) = ?'),
            (name.lower(), platform.lower()),
        )
        influencer = cursor.fetchone()
        if not influencer:
            return jsonify({'error': 'Influencer not found.'}), 404

        cursor.execute(
            adapt_query('SELECT id FROM favorites WHERE user_email = ? AND influencer_id = ?'),
            (email, influencer['id']),
        )
        favorite = cursor.fetchone()

        if favorite:
            cursor.execute(adapt_query('DELETE FROM favorites WHERE id = ?'), (favorite['id'],))
            conn.commit()
            return jsonify({'message': 'Favorite removed.'})

        cursor.execute(
            adapt_query('INSERT INTO favorites (user_email, influencer_id, created_at) VALUES (?, ?, ?)'),
            (email, influencer['id'], datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
        )
        conn.commit()
        return jsonify({'message': 'Favorite added.'})

    cursor.execute(
        adapt_query('SELECT i.* FROM influencers i JOIN favorites f ON f.influencer_id = i.id WHERE f.user_email = ? ORDER BY f.created_at DESC'),
        (email,),
    )
    rows = cursor.fetchall()
    favorites_list = [row_to_dict(row) for row in rows]
    return jsonify(favorites_list)


def require_admin():
    user = session.get('user')
    if not user or not user.get('is_admin'):
        return None
    return user

@app.route('/api/admin/stats')
def admin_stats():
    if not require_admin():
        return jsonify({'error': 'Unauthorized access.'}), 403

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) AS count FROM users')
    total_users = cursor.fetchone()['count']
    cursor.execute(
        adapt_query('SELECT COUNT(*) AS count FROM users WHERE created_at >= ?'),
        ((datetime.datetime.utcnow() - datetime.timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S'),),
    )
    active_users = cursor.fetchone()['count']
    cursor.execute('SELECT COUNT(*) AS count FROM influencers')
    total_profiles = cursor.fetchone()['count']
    cursor.execute(
        adapt_query('SELECT COUNT(*) AS count FROM influencers WHERE LOWER(platform) = ?'),
        ('instagram',),
    )
    instagram_profiles = cursor.fetchone()['count']
    cursor.execute(
        adapt_query('SELECT COUNT(*) AS count FROM influencers WHERE LOWER(platform) = ?'),
        ('youtube',),
    )
    youtube_profiles = cursor.fetchone()['count']

    return jsonify({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'totalProfiles': total_profiles,
        'instagramProfiles': instagram_profiles,
        'youtubeProfiles': youtube_profiles,
    })


@app.route('/api/admin/chart-data')
def admin_chart_data():
    if not require_admin():
        return jsonify({'error': 'Unauthorized access.'}), 403

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        'SELECT platform, COUNT(*) AS count FROM influencers GROUP BY LOWER(platform)'
    )
    rows = cursor.fetchall()
    platform_stats = {row['platform']: row['count'] for row in rows}
    return jsonify({'platformStats': platform_stats})


@app.route('/api/instagram/login')
def instagram_login():
    session['instagram_user'] = {
        'id': 'instagram_user_001',
        'username': 'socialconnect_demo',
    }
    return redirect('/instagram-data.html')


@app.route('/api/instagram/user-data', methods=['GET'])
def instagram_user_data():
    user = session.get('instagram_user')
    if not user:
        return jsonify({'error': 'Not logged in with Instagram.'}), 401

    media = [
        {
            'id': 'ig_001',
            'media_type': 'IMAGE',
            'media_url': 'https://via.placeholder.com/500x500.png?text=Instagram+Post+1',
            'caption': 'Sample Instagram post from Social Connect Hub.',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'permalink': 'https://instagram.com/',
        },
        {
            'id': 'ig_002',
            'media_type': 'IMAGE',
            'media_url': 'https://via.placeholder.com/500x500.png?text=Instagram+Post+2',
            'caption': 'Another post to help you test the dashboard.',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'permalink': 'https://instagram.com/',
        },
    ]

    return jsonify({'user': user, 'media': media})


@app.route('/api/instagram/logout', methods=['GET', 'POST'])
def instagram_logout():
    session.pop('instagram_user', None)
    return jsonify({'message': 'Instagram session ended.'})


@app.route('/admin.html')
def serve_admin_page():
    user = session.get('user')
    if not user or not user.get('is_admin'):
        return redirect('/login.html')
    return send_from_directory(FRONTEND_DIR, 'admin.html')

@app.route('/js/<path:path>')
def serve_js(path):
    requested_path = os.path.join(JS_DIR, path)
    if os.path.exists(requested_path) and not os.path.isdir(requested_path):
        return send_from_directory(JS_DIR, path)
    return jsonify({'error': 'JavaScript file not found.'}), 404

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api/'):
        return jsonify({'error': 'API route not found.'}), 404

    requested_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(requested_path) and not os.path.isdir(requested_path):
        return send_from_directory(FRONTEND_DIR, path)

    # Serve frontend JS files from the top-level js folder
    js_path = os.path.join(JS_DIR, path)
    if os.path.exists(js_path) and not os.path.isdir(js_path):
        return send_from_directory(JS_DIR, path)

    return send_from_directory(FRONTEND_DIR, 'index.html')


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
