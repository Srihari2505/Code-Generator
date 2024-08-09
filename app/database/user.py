import sqlite3


def setup_database():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            bio TEXT,
            profile_pic BLOB
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            email TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    
    conn.commit()
    conn.close()




def register_user(username, password, name, email):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return False
    cursor.execute('INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)', (username, password, name, email))
    conn.commit()
    conn.close()
    return True


def authenticate_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()
    return user is not None

def get_user_profile(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT name, email, bio, profile_pic FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    if user:
        profile =  {
            'name': user[0],
            'email': user[1],
            'bio': user[2],
            'profile_pic': user[3]
        }
        return profile
    return None


def update_user_profile(username, name, email, bio, profile_pic):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    if profile_pic is not None:
        cursor.execute('UPDATE users SET name = ?, email = ?, bio = ?, profile_pic = ? WHERE username = ?', 
                       (name, email, bio, profile_pic.read(), username))
    else:
        cursor.execute('UPDATE users SET name = ?, email = ?, bio = ? WHERE username = ?', 
                       (name, email, bio, username))
    conn.commit()
    conn.close()