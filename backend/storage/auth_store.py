import os
import json
import uuid
import hmac
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from backend.storage.database import get_connection, get_mongo_db

SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "studybrain_secret_jwt_key_2026_super_secure")

def _hash_password(password: str, salt: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def create_user(email: str, username: str, password: str, display_name: str = None) -> dict:
    """Registers a new user in MongoDB Atlas or SQLite."""
    email = email.strip().lower()
    username = username.strip().lower()
    display_name = display_name.strip() if display_name else username.capitalize()
    
    user_id = str(uuid.uuid4())
    salt = secrets.token_hex(16)
    password_hash = _hash_password(password, salt)
    created_at = datetime.utcnow().isoformat()
    
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            # Check for existing email or username
            existing = mongo.users.find_one({
                "$or": [{"email": email}, {"username": username}]
            })
            if existing:
                if existing.get("email") == email:
                    raise ValueError("An account with this email already exists.")
                raise ValueError("This username is already taken.")
                
            user_doc = {
                "id": user_id,
                "email": email,
                "username": username,
                "display_name": display_name,
                "password_hash": password_hash,
                "salt": salt,
                "created_at": created_at
            }
            mongo.users.insert_one(user_doc)
            return {
                "id": user_id,
                "email": email,
                "username": username,
                "display_name": display_name,
                "created_at": created_at
            }
        except ValueError:
            raise
        except Exception as e:
            print(f"MongoDB create_user error: {e}")

    # Fallback to SQLite
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?", 
            (email, username)
        ).fetchone()
        if existing:
            if existing["email"] == email:
                raise ValueError("An account with this email already exists.")
            raise ValueError("This username is already taken.")
            
        conn.execute("""
            INSERT INTO users (id, email, username, display_name, password_hash, salt, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, email, username, display_name, password_hash, salt, created_at))
        conn.commit()
        return {
            "id": user_id,
            "email": email,
            "username": username,
            "display_name": display_name,
            "created_at": created_at
        }
    finally:
        conn.close()

def authenticate_user(identifier: str, password: str) -> dict:
    """Authenticates by email or username."""
    identifier = identifier.strip().lower()
    
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            user = mongo.users.find_one({
                "$or": [{"email": identifier}, {"username": identifier}]
            })
            if user:
                computed_hash = _hash_password(password, user["salt"])
                if hmac.compare_digest(computed_hash, user["password_hash"]):
                    return {
                        "id": user["id"],
                        "email": user["email"],
                        "username": user["username"],
                        "display_name": user.get("display_name", user["username"]),
                        "created_at": user.get("created_at")
                    }
                return None
        except Exception as e:
            print(f"MongoDB authenticate_user error: {e}")

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?", 
            (identifier, identifier)
        ).fetchone()
        if row:
            computed_hash = _hash_password(password, row["salt"])
            if hmac.compare_digest(computed_hash, row["password_hash"]):
                return {
                    "id": row["id"],
                    "email": row["email"],
                    "username": row["username"],
                    "display_name": row["display_name"] or row["username"],
                    "created_at": row["created_at"]
                }
            return None
        return None
    finally:
        conn.close()

def get_user_by_id(user_id: str) -> dict:
    """Retrieves user info by user_id."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            user = mongo.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0, "salt": 0})
            if user:
                return user
        except Exception as e:
            print(f"MongoDB get_user_by_id error: {e}")

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, email, username, display_name, created_at FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()

def generate_token(user_id: str, email: str, username: str) -> str:
    """Creates a signed HMAC token (JWT-style)."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "user_id": user_id,
        "email": email,
        "username": username,
        "exp": int((datetime.utcnow() + timedelta(days=30)).timestamp())
    }
    
    def b64_encode(d: dict) -> str:
        s = json.dumps(d, separators=(',', ':')).encode('utf-8')
        return base64.urlsafe_b64encode(s).decode('utf-8').rstrip('=')
        
    h_b64 = b64_encode(header)
    p_b64 = b64_encode(payload)
    message = f"{h_b64}.{p_b64}".encode('utf-8')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), message, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode('utf-8').rstrip('=')
    
    return f"{h_b64}.{p_b64}.{sig_b64}"

def verify_token(token: str) -> dict:
    """Verifies a signed token and returns the payload if valid."""
    if not token:
        return None
        
    parts = token.split('.')
    if len(parts) != 3:
        return None
        
    h_b64, p_b64, sig_b64 = parts
    message = f"{h_b64}.{p_b64}".encode('utf-8')
    expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), message, hashlib.sha256).digest()
    expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode('utf-8').rstrip('=')
    
    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        return None
        
    try:
        # Pad base64 string
        rem = len(p_b64) % 4
        if rem > 0:
            p_b64 += '=' * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(p_b64).decode('utf-8'))
        
        # Check expiration
        if payload.get("exp", 0) < int(datetime.utcnow().timestamp()):
            return None
            
        return payload
    except Exception:
        return None

