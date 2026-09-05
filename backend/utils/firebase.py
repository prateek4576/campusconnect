import json
import os

import firebase_admin
from firebase_admin import credentials, messaging


def initialize_firebase():

    if firebase_admin._apps:
        return

    # ---------------------------------------------
    # Render: service account stored as JSON string
    # ---------------------------------------------

    service_account_json = os.environ.get(
        "FIREBASE_SERVICE_ACCOUNT_JSON"
    )

    if service_account_json:

        service_account_info = json.loads(
            service_account_json
        )

        cred = credentials.Certificate(
            service_account_info
        )

    else:

        # -----------------------------------------
        # Local development: JSON file path
        # -----------------------------------------

        credentials_path = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS"
        )

        if not credentials_path:
            raise RuntimeError(
                "Firebase credentials are not configured"
            )

        cred = credentials.Certificate(
            credentials_path
        )

    firebase_admin.initialize_app(
        cred
    )


def send_push_notification(
    installation_id: str,
    title: str,
    body: str,
    url: str = "/messages",
    conversation_id: str | None = None,
):

    initialize_firebase()

    # Your production frontend URL
    frontend_url = os.environ.get(
        "FRONTEND_URL",
        "https://campusconnect-prateek57.vercel.app"
    ).rstrip("/")

    # Convert "/messages" into a full HTTPS URL
    if url.startswith("http://") or url.startswith("https://"):
        notification_url = url
    else:
        notification_url = f"{frontend_url}/{url.lstrip('/')}"

    data = {
        "title": title,
        "body": body,
        "url": notification_url,
        "conversation_id": conversation_id or "",
    }

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),

        data=data,

        token=installation_id,

        webpush=messaging.WebpushConfig(
            fcm_options=messaging.WebpushFCMOptions(
                link=notification_url
            )
        ),
    )

    return messaging.send(message)

def send_new_item_notification(
    installation_id: str,
    item_type: str,
    item_title: str,
    location: str,
    item_id: str,
):
    """
    Send notification when a new Lost/Found item is posted.
    """

    if item_type == "lost":
        title = "New Lost Item"
        body = f"{item_title} was reported lost near {location}."
        url = "/items/lost"

    else:
        title = "New Found Item"
        body = f"{item_title} was reported found near {location}."
        url = "/items/found"

    print(
        f"🔔 Sending {item_type} notification "
        f"to token {installation_id[:20]}..."
    )

    try:

        response = send_push_notification(
            installation_id=installation_id,
            title=title,
            body=body,
            url=url,
            conversation_id=None,
        )

        print(
            f"✅ {item_type} notification sent successfully: "
            f"{response}"
        )

        return response

    except Exception as e:

        print(
            f"❌ Failed to send {item_type} notification: {e}"
        )

        return None