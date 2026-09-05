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

    data = {
        "conversation_id": conversation_id or "",
    }

    message = messaging.Message(
        token=installation_id,

        notification=messaging.Notification(
            title=title,
            body=body,
        ),

        data=data,

        webpush=messaging.WebpushConfig(
            fcm_options=messaging.WebpushFCMOptions(
                link=url
            )
        ),
    )

    return messaging.send(message)