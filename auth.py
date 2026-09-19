import os
import hashlib
import hmac
import base64
import json
import time
from typing import Optional, Dict, Any, Tuple

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "vocal_separator_secret_key_2026_studio")

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    if not salt:
        salt = base64.b64encode(os.urandom(16)).decode('utf-8')
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    hash_hex = key.hex()
    return hash_hex, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(new_hash, stored_hash)

def generate_token(user_id: int, username: str, email: str, expires_in_seconds: int = 86400 * 30) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "email": email,
        "exp": int(time.time()) + expires_in_seconds
    }
    payload_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode('utf-8').rstrip('=')
    
    signature = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    
    return f"{payload_b64}.{sig_b64}"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, sig_b64 = parts
        
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode('utf-8').rstrip('=')
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
            
        # Add padding back if necessary
        padded_payload = payload_b64 + '=' * (-len(payload_b64) % 4)
        payload_bytes = base64.urlsafe_b64decode(padded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp") and time.time() > payload["exp"]:
            return None
            
        return payload
    except Exception:
        return None
