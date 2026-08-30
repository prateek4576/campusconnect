import os

import bcrypt
import jwt

from datetime import datetime, timezone, timedelta


# =====================================================
# JWT CONFIGURATION
# =====================================================

JWT_ALGORITHM = "HS256"


# =====================================================
# JWT SECRET
# =====================================================

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# =====================================================
# PASSWORD HASHING
# =====================================================

def hash_password(password: str) -> str:
    """
    Hash a user's password using bcrypt.
    """

    salt = bcrypt.gensalt()

    return bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    ).decode("utf-8")


def verify_password(
    plain: str,
    hashed: str
) -> bool:
    """
    Verify a plain-text password
    against a bcrypt password hash.
    """

    return bcrypt.checkpw(
        plain.encode("utf-8"),
        hashed.encode("utf-8")
    )


# =====================================================
# USER ACCESS TOKEN
# =====================================================

def create_access_token(
    user_id: str,
    email: str
) -> str:

    payload = {
        "sub": user_id,
        "email": email,

        # User stays logged in for 7 days
        "exp": datetime.now(
            timezone.utc
        ) + timedelta(days=7),

        "type": "access",
    }

    return jwt.encode(
        payload,
        get_jwt_secret(),
        algorithm=JWT_ALGORITHM
    )


# =====================================================
# ADMIN ACCESS TOKEN
# =====================================================

def create_admin_token() -> str:

    payload = {
        "sub": os.environ["ADMIN_ID"],

        # Admin session lasts 8 hours
        "exp": datetime.now(
            timezone.utc
        ) + timedelta(hours=8),

        "type": "admin",
    }

    return jwt.encode(
        payload,
        get_jwt_secret(),
        algorithm=JWT_ALGORITHM
    )


# =====================================================
# DECODE TOKEN
# =====================================================

def decode_token(token: str) -> dict:

    return jwt.decode(
        token,
        get_jwt_secret(),
        algorithms=[JWT_ALGORITHM]
    )