import uuid
import os
import smtplib
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from config.database import db
from models.contact import ContactInput
from dependencies.auth import get_current_user

import logging


logger = logging.getLogger(__name__)


router = APIRouter(
    tags=["Contact"]
)


# =====================================================
# CONTACT / FEEDBACK
# =====================================================

@router.post("/contact")
async def contact_form(
    payload: ContactInput,
    user: dict = Depends(get_current_user)
):

    sender_email = os.environ.get(
        "EMAIL_USER"
    )

    sender_password = os.environ.get(
        "EMAIL_PASS"
    )

    # =================================================
    # SAVE FEEDBACK TO MONGODB
    # =================================================

    feedback_doc = {
        "id": str(uuid.uuid4()),

        "name": payload.name.strip(),

        "email": payload.email.lower().strip(),

        "type": payload.type.strip(),

        "message": payload.message.strip(),

        "user_id": user["id"],

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    await db.feedbacks.insert_one(
        feedback_doc
    )

    # =================================================
    # EMAIL CONFIGURATION
    # =================================================

    if not sender_email or not sender_password:

        raise HTTPException(
            status_code=500,
            detail="Email service is not configured"
        )

    try:

        message = MIMEMultipart()

        message["From"] = f"CampusConnect <{sender_email}>"

        message["To"] = sender_email

        message["Reply-To"] = payload.email

        message["Subject"] = (
    f"CampusConnect - {payload.type}"
)

        body = f"""
New message from CampusConnect

TYPE:
{payload.type}

USER:
{payload.name}

EMAIL:
{payload.email}

MESSAGE:
{payload.message}

--------------------------------
CampusConnect Feedback System
"""

        message.attach(
            MIMEText(
                body,
                "plain"
            )
        )

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as server:

            server.starttls()

            server.login(
                sender_email,
                sender_password
            )

            server.sendmail(
    sender_email,
    sender_email,
    message.as_string()
)

        return {
            "success": True,
            "message": "Message sent successfully"
        }

    except Exception as e:

        logger.error(
            f"Contact email failed: {e}"
        )

        # Feedback has already been
        # saved to MongoDB

        return {
            "success": True,
            "message": (
                "Feedback saved, "
                "but email could not be sent"
            )
        }