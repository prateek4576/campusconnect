import os

from fastapi import (
    Request,
    HTTPException,
)

from config.database import db
from utils.auth import decode_token


# =====================================================
# CURRENT USER
# =====================================================

async def get_current_user(
    request: Request
) -> dict:

    # -------------------------------------------------
    # First try HTTP-only cookie
    # -------------------------------------------------

    token = request.cookies.get(
        "access_token"
    )

    # -------------------------------------------------
    # If cookie doesn't exist,
    # try Authorization header
    # -------------------------------------------------

    if not token:

        auth_header = request.headers.get(
            "Authorization",
            ""
        )

        if auth_header.startswith(
            "Bearer "
        ):
            token = auth_header[7:]

    # -------------------------------------------------
    # No token
    # -------------------------------------------------

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    # -------------------------------------------------
    # Decode token
    # -------------------------------------------------

    try:

        payload = decode_token(token)

        # Make sure this is a normal user token
        if payload.get("type") != "access":

            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        # -------------------------------------------------
        # Find user in MongoDB
        # -------------------------------------------------

        user = await db.users.find_one(
            {
                "id": payload["sub"]
            }
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # Don't send MongoDB's internal ID
        user.pop(
            "_id",
            None
        )

        # Never expose password hash
        user.pop(
            "password_hash",
            None
        )

        return user

    except Exception as e:

        # Don't accidentally convert our own
        # HTTPException into "Invalid token"

        if isinstance(
            e,
            HTTPException
        ):
            raise

        # jwt exceptions
        import jwt

        if isinstance(
            e,
            jwt.ExpiredSignatureError
        ):
            raise HTTPException(
                status_code=401,
                detail="Token expired"
            )

        if isinstance(
            e,
            jwt.InvalidTokenError
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication"
        )


# =====================================================
# CURRENT ADMIN
# =====================================================

def get_current_admin(
    request: Request
) -> dict:

    # -------------------------------------------------
    # Get Authorization header
    # -------------------------------------------------

    token = request.headers.get(
        "Authorization",
        ""
    )

    if not token.startswith(
        "Bearer "
    ):

        raise HTTPException(
            status_code=401,
            detail="Admin authentication required"
        )

    token = token[7:]

    # -------------------------------------------------
    # Decode admin token
    # -------------------------------------------------

    try:

        payload = decode_token(token)

        # -------------------------------------------------
        # Make sure token belongs to admin
        # -------------------------------------------------

        if payload.get("type") != "admin":

            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )

        # -------------------------------------------------
        # Check admin ID
        # -------------------------------------------------

        if payload.get("sub") != os.environ["ADMIN_ID"]:

            raise HTTPException(
                status_code=403,
                detail="Invalid admin"
            )

        return {
            "admin_id": payload["sub"],
            "type": "admin"
        }

    except Exception as e:

        if isinstance(
            e,
            HTTPException
        ):
            raise

        import jwt

        if isinstance(
            e,
            jwt.ExpiredSignatureError
        ):
            raise HTTPException(
                status_code=401,
                detail="Admin session expired"
            )

        if isinstance(
            e,
            jwt.InvalidTokenError
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid admin token"
            )

        raise HTTPException(
            status_code=401,
            detail="Invalid admin authentication"
        )