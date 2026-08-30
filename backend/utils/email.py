import os
import logging
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


logger = logging.getLogger(__name__)


# =====================================================
# SEND NEW ITEM EMAIL
# =====================================================

def send_new_item_email(
    item: dict,
    recipients: list[str]
):

    # -------------------------------------------------
    # No recipients
    # -------------------------------------------------

    if not recipients:
        return

    # -------------------------------------------------
    # Email credentials
    # -------------------------------------------------

    sender_email = os.environ.get(
        "EMAIL_USER"
    )

    sender_password = os.environ.get(
        "EMAIL_PASS"
    )

    if not sender_email or not sender_password:

        logger.error(
            "EMAIL_USER or EMAIL_PASS is missing"
        )

        return

    # -------------------------------------------------
    # Item information
    # -------------------------------------------------

    item_type = item["type"].upper()

    subject = (
        f"CampusConnect - "
        f"New {item_type} Item: "
        f"{item['title']}"
    )

    body = f"""
Hello,

A new {item_type.lower()} item has been posted on CampusConnect.

ITEM DETAILS
------------

Item: {item["title"]}
Category: {item["category"]}
Location: {item["location"]}
Date: {item["date"]}

Description:
{item["description"]}

Please visit CampusConnect to view the complete details.

Thank you,
CampusConnect Team
"""

    # -------------------------------------------------
    # Send emails
    # -------------------------------------------------

    try:

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as server:

            server.starttls()

            server.login(
                sender_email,
                sender_password
            )

            # Send one email to each user
            for recipient in recipients:

                message = MIMEMultipart()

                message["From"] = sender_email
                message["To"] = recipient
                message["Subject"] = subject

                message.attach(
                    MIMEText(
                        body,
                        "plain"
                    )
                )

                server.sendmail(
                    sender_email,
                    recipient,
                    message.as_string()
                )

        logger.info(
            f"Notification emails sent to "
            f"{len(recipients)} users"
        )

    except Exception as e:

        logger.error(
            f"Failed to send notification emails: {e}"
        )


        # =====================================================
# SEND EMAIL VERIFICATION CODE
# =====================================================

def send_verification_email(
    recipient_email: str,
    otp: str
):

    # -------------------------------------------------
    # Email credentials
    # -------------------------------------------------

    sender_email = os.environ.get(
        "EMAIL_USER"
    )

    sender_password = os.environ.get(
        "EMAIL_PASS"
    )

    if not sender_email or not sender_password:

        logger.error(
            "EMAIL_USER or EMAIL_PASS is missing"
        )

        raise RuntimeError(
            "Email configuration is missing"
        )

    # -------------------------------------------------
    # Email information
    # -------------------------------------------------

    subject = (
        "CampusConnect - Verify Your Email"
    )

    body = f"""
Hello,

Welcome to CampusConnect!

Your email verification code is:

{otp}

This code will expire in 10 minutes.

Please enter this code on the CampusConnect
website to verify your email address.

If you did not try to create a CampusConnect
account, you can safely ignore this email.

Thank you,
CampusConnect Team
"""

    # -------------------------------------------------
    # Create email
    # -------------------------------------------------

    message = MIMEMultipart()

    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = subject

    message.attach(
        MIMEText(
            body,
            "plain"
        )
    )

    # -------------------------------------------------
    # Send email
    # -------------------------------------------------

    try:

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
                recipient_email,
                message.as_string()
            )

        logger.info(
            f"Verification email sent to "
            f"{recipient_email}"
        )

    except Exception as e:

        logger.error(
            f"Failed to send verification email: {e}"
        )

        raise


    # =====================================================
# SEND NEW MESSAGE EMAIL
# =====================================================

def send_new_message_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    item_title: str,
):
    """
    Sends an email notification when another user
    sends a message.
    """

    if not recipient_email:
        return

    # -------------------------------------------------
    # Email credentials
    # -------------------------------------------------

    sender_email = os.environ.get(
        "EMAIL_USER"
    )

    sender_password = os.environ.get(
        "EMAIL_PASS"
    )

    if not sender_email or not sender_password:

        logger.error(
            "EMAIL_USER or EMAIL_PASS is missing"
        )

        return

    # -------------------------------------------------
    # Email content
    # -------------------------------------------------

    subject = (
        "CampusConnect - "
        "You have a new message"
    )

    body = f"""
Hello {recipient_name},

You have received a new message on CampusConnect.

MESSAGE DETAILS
---------------

From: {sender_name}
Item: {item_title}

Someone has contacted you about an item you posted.

Please log in to CampusConnect to view the message
and reply to the conversation.

For your privacy and security, the message content
is not included in this email.

Thank you,
CampusConnect Team
"""

    # -------------------------------------------------
    # Send email
    # -------------------------------------------------

    try:

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as server:

            server.starttls()

            server.login(
                sender_email,
                sender_password
            )

            message = MIMEMultipart()

            message["From"] = (
                f"CampusConnect <{sender_email}>"
            )

            message["To"] = recipient_email

            message["Subject"] = subject

            message.attach(
                MIMEText(
                    body,
                    "plain"
                )
            )

            server.sendmail(
                sender_email,
                recipient_email,
                message.as_string()
            )

        logger.info(
            f"New message notification sent to "
            f"{recipient_email}"
        )

    except Exception as e:

        logger.error(
            f"Failed to send new message email: {e}"
        )