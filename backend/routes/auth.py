import uuid
import secrets
import hashlib
import random
from datetime import datetime, timezone, timedelta

from utils.email import send_verification_email

from fastapi import APIRouter, HTTPException, Response, Depends, Request

from config.database import db
from models.auth import (
    RegisterInput,
    LoginInput,
    AdminLoginInput,
    AdminUserUpdate,
    UserProfileUpdate,

    # Email verification
    RequestVerificationInput,
    VerifyEmailInput,
    CompleteRegistrationInput,
)

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




# =====================================================
# REGISTER
# =====================================================
# =====================================================
# REQUEST EMAIL VERIFICATION
# =====================================================

# =====================================================
# REQUEST EMAIL VERIFICATION
# =====================================================

@router.post("/register/request")
async def request_registration(
    payload: RequestVerificationInput
):
    email = payload.email.lower().strip()

    # ---------------------------------------------
    # Check if email is already registered
    # ---------------------------------------------

    existing = await db.users.find_one({
        "email": email
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # ---------------------------------------------
    # Generate OTP
    # ---------------------------------------------

    otp = generate_otp()

    otp_hash = hash_otp(otp)

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    # ---------------------------------------------
    # Remove previous verification
    # ---------------------------------------------

    await db.email_verifications.delete_many({
        "email": email
    })

    # ---------------------------------------------
    # Store temporary registration
    # ---------------------------------------------

    verification_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "phone": payload.phone.strip(),
        "otp_hash": otp_hash,
        "expires_at": expires_at,
        "attempts": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc),
    }

    await db.email_verifications.insert_one(
        verification_doc
    )

    # ---------------------------------------------
    # Send verification email
    # ---------------------------------------------

    try:
        send_verification_email(
            email,
            otp
        )

    except Exception as e:

        await db.email_verifications.delete_one({
            "id": verification_doc["id"]
        })

        print(
            "Email sending error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not send verification email"
        )

    # ---------------------------------------------
    # Success
    # ---------------------------------------------

    return {
        "success": True,
        "message": "Verification code sent"
    }

# =====================================================
# VERIFY EMAIL
# =====================================================

@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailInput
):
    email = payload.email.lower().strip()

    verification = await db.email_verifications.find_one({
        "email": email
    })

    if not verification:
        raise HTTPException(
            status_code=400,
            detail="Verification request not found"
        )

    # ---------------------------------------------
    # Check expiration
    # ---------------------------------------------

    now = datetime.now(timezone.utc)

    expires_at = verification["expires_at"]

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if now > expires_at:

        await db.email_verifications.delete_one({
            "email": email
        })

        raise HTTPException(
            status_code=400,
            detail="Verification code has expired"
        )

    # ---------------------------------------------
    # Limit attempts
    # ---------------------------------------------

    if verification.get("attempts", 0) >= 5:

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new code."
        )

    # ---------------------------------------------
    # Check OTP
    # ---------------------------------------------

    if hash_otp(payload.otp.strip()) != verification["otp_hash"]:

        await db.email_verifications.update_one(
            {
                "email": email
            },
            {
                "$inc": {
                    "attempts": 1
                }
            }
        )

        raise HTTPException(
            status_code=400,
            detail="Incorrect verification code"
        )

    # ---------------------------------------------
    # Generate temporary verification token
    # ---------------------------------------------

    verification_token = generate_verification_token()

    verification_token_hash = hashlib.sha256(
        verification_token.encode()
    ).hexdigest()

    await db.email_verifications.update_one(
        {
            "email": email
        },
        {
            "$set": {
                "verified": True,
                "verification_token_hash":
                    verification_token_hash,
                "verified_at": now
            }
        }
    )

    return {
        "success": True,
        "message": "Email verified successfully",
        "verification_token": verification_token
    }


# =====================================================
# COMPLETE REGISTRATION
# =====================================================

@router.post("/register/complete")
async def complete_registration(
    payload: CompleteRegistrationInput,
    response: Response
):
    email = payload.email.lower().strip()

    # ---------------------------------------------
    # Validate password
    # ---------------------------------------------

    if len(payload.password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    # ---------------------------------------------
    # Check existing account
    # ---------------------------------------------

    existing = await db.users.find_one({
        "email": email
    })

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # ---------------------------------------------
    # Find verification
    # ---------------------------------------------

    verification = await db.email_verifications.find_one({
        "email": email,
        "verified": True
    })

    if not verification:

        raise HTTPException(
            status_code=400,
            detail="Email has not been verified"
        )

    # ---------------------------------------------
    # Verify temporary token
    # ---------------------------------------------

    token_hash = hashlib.sha256(
        payload.verification_token.encode()
    ).hexdigest()

    if token_hash != verification.get(
        "verification_token_hash"
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid verification session"
        )

    # ---------------------------------------------
    # Create user
    # ---------------------------------------------

    user_doc = {
        "id": str(uuid.uuid4()),

        "name": payload.name.strip(),

        "email": email,

        "phone": payload.phone.strip(),

        "password_hash": hash_password(
            payload.password
        ),

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    await db.users.insert_one(
        user_doc
    )

    # ---------------------------------------------
    # Delete verification record
    # ---------------------------------------------

    await db.email_verifications.delete_one({
        "email": email
    })

    # ---------------------------------------------
    # Login user automatically
    # ---------------------------------------------

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
# RESEND VERIFICATION CODE
# =====================================================

@router.post("/register/resend")
async def resend_verification(
    payload: RequestVerificationInput
):
    email = payload.email.lower().strip()

    existing = await db.users.find_one({
        "email": email
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    verification = await db.email_verifications.find_one({
        "email": email
    })

    if not verification:
        raise HTTPException(
            status_code=400,
            detail="No verification request found"
        )

    # ---------------------------------------------
    # Generate new OTP
    # ---------------------------------------------

    otp = generate_otp()

    otp_hash = hash_otp(otp)

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    await db.email_verifications.update_one(
        {
            "email": email
        },
        {
            "$set": {
                "otp_hash": otp_hash,
                "expires_at": expires_at,
                "attempts": 0,
                "verified": False
            },
            "$unset": {
                "verification_token_hash": ""
            }
        }
    )

    # ---------------------------------------------
    # Send email
    # ---------------------------------------------

    try:

        send_verification_email(
            email,
            otp
        )

    except Exception as e:

        print(
            "Email sending error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not send verification email"
        )

    return {
        "success": True,
        "message": "New verification code sent"
    }

    email = payload.email.lower().strip()

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    existing = await db.users.find_one({
        "email": email
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "phone": payload.phone.strip(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.users.insert_one(user_doc)

    await db.email_verifications.delete_one({
    "email": email
})

    token = create_access_token(
        user_doc["id"],
        email
    )

    set_auth_cookie(response, token)

    return {
        "user": public_user(user_doc),
        "token": token
    }


# =====================================================
# LOGIN
# =====================================================

@router.post("/login")
async def login(
    payload: LoginInput,
    response: Response
):
    email = payload.email.lower().strip()

    user = await db.users.find_one({
        "email": email
    })

    if not user or not verify_password(
        payload.password,
        user["password_hash"]
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