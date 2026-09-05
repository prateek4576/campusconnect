import uuid
import secrets
import hashlib
import random
import os
from datetime import datetime, timezone, timedelta

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models.auth import (
    RegisterInput,
    LoginInput,
    AdminLoginInput,
    AdminUserUpdate,
    UserProfileUpdate,
    GoogleLoginInput,
)


from fastapi import APIRouter, HTTPException, Response, Depends, Request

from config.database import db

from utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_admin_token,
)

from dependencies.auth import get_current_user, get_current_admin


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =====================================================
# HELPER
# =====================================================

def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "created_at": user.get("created_at"),
    }


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

def hash_otp(otp: str) -> str:
    return hashlib.sha256(
        otp.encode()
    ).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)


@router.post("/login")
async def login(
    payload: LoginInput,
    response: Response
):
    email = payload.email.lower().strip()

    user = await db.users.find_one({
        "email": email
    })

    if not user:
        raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )

    password_hash = user.get("password_hash")

    if (
        user.get("auth_provider") == "google"
        and not password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google Sign-In. "
                "Please click 'Continue with Google'."
            )
        )

    if not password_hash or not verify_password(
        payload.password,
        password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

   

    token = create_access_token(
        user["id"],
        email
    )

    set_auth_cookie(response, token)

    return {
        "user": public_user(user),
        "token": token
    }


# =====================================================
# LOGOUT
# =====================================================

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/"
    )

    return {
        "ok": True
    }


# =====================================================
# CURRENT USER
# =====================================================

@router.get("/me")
async def me(
    user: dict = Depends(get_current_user)
):
    return public_user(user)


# =====================================================
# UPDATE PROFILE
# =====================================================

@router.put("/profile")
async def update_profile(
    payload: UserProfileUpdate,
    user: dict = Depends(get_current_user)
):
    new_email = payload.email.lower().strip()

    existing = await db.users.find_one({
        "email": new_email,
        "id": {
            "$ne": user["id"]
        }
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    await db.users.update_one(
        {
            "id": user["id"]
        },
        {
            "$set": {
                "name": payload.name.strip(),
                "email": new_email,
                "phone": payload.phone.strip()
            }
        }
    )

    # Update information stored in user's posts
    await db.items.update_many(
        {
            "user_id": user["id"]
        },
        {
            "$set": {
                "user_name": payload.name.strip(),
                "user_email": new_email,
                "user_phone": payload.phone.strip()
            }
        }
    )

    updated_user = await db.users.find_one(
        {
            "id": user["id"]
        },
        {
            "_id": 0,
            "password_hash": 0
        }
    )

    return updated_user

# =====================================================
# GOOGLE LOGIN / SIGNUP
# =====================================================

@router.post("/google")
async def google_login(
    payload: GoogleLoginInput,
    response: Response
):

    google_client_id = os.environ.get(
        "GOOGLE_CLIENT_ID"
    )

    if not google_client_id:
        raise HTTPException(
            status_code=500,
            detail="Google authentication is not configured"
        )

    try:

        # Verify Google's ID token
        google_user = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            google_client_id
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    # -------------------------------------------------
    # Get verified Google information
    # -------------------------------------------------

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")

    email_verified = google_user.get(
        "email_verified",
        False
    )

    if not google_id or not email:
        raise HTTPException(
            status_code=400,
            detail="Google account information is incomplete"
        )

    if not email_verified:
        raise HTTPException(
            status_code=400,
            detail="Google email is not verified"
        )

    email = email.lower().strip()

    # -------------------------------------------------
    # Check existing user
    # -------------------------------------------------

    existing_user = await db.users.find_one({
        "email": email
    })

    # -------------------------------------------------
    # EXISTING USER
    # -------------------------------------------------

    if existing_user:

        # Save Google ID if this account
        # has not previously been linked.
        if not existing_user.get("google_id"):

            await db.users.update_one(
                {
                    "id": existing_user["id"]
                },
                {
                    "$set": {
                        "google_id": google_id,
                        "auth_provider": "google"
                    }
                }
            )

            existing_user["google_id"] = google_id
            existing_user["auth_provider"] = "google"

        token = create_access_token(
            existing_user["id"],
            existing_user["email"]
        )

        set_auth_cookie(
            response,
            token
        )

        return {
            "user": public_user(existing_user),
            "token": token
        }

    # -------------------------------------------------
    # NEW USER
    # -------------------------------------------------

    user_doc = {
        "id": str(uuid.uuid4()),

        "name": name or "Google User",

        "email": email,

        # Google does not provide the phone
        # number we use in CampusConnect.
        "phone": "",

        # No password for Google accounts
        "auth_provider": "google",

        "google_id": google_id,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    await db.users.insert_one(
        user_doc
    )

    token = create_access_token(
        user_doc["id"],
        email
    )

    set_auth_cookie(
        response,
        token
    )

    return {
        "user": public_user(user_doc),
        "token": token
    }

# =====================================================
# MANUAL REGISTER
# =====================================================

@router.post("/register")
async def register(
    payload: RegisterInput,
    response: Response
):
    email = payload.email.lower().strip()

    # -------------------------------------------------
    # CHECK EXISTING USER
    # -------------------------------------------------

    existing = await db.users.find_one({
        "email": email
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # -------------------------------------------------
    # VALIDATE PASSWORD
    # -------------------------------------------------

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    # -------------------------------------------------
    # CREATE USER
    # -------------------------------------------------

    user_doc = {
        "id": str(uuid.uuid4()),

        "name": payload.name.strip(),

        "email": email,

        "phone": (
            payload.phone.strip()
            if payload.phone
            else ""
        ),

        "password_hash": hash_password(
            payload.password
        ),

        "auth_provider": "local",

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    await db.users.insert_one(
        user_doc
    )

    # -------------------------------------------------
    # AUTO LOGIN
    # -------------------------------------------------

    token = create_access_token(
        user_doc["id"],
        email
    )

    set_auth_cookie(
        response,
        token
    )

    return {
        "user": public_user(user_doc),
        "token": token
    }