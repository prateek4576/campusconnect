import os

import firebase_admin
from firebase_admin import (
    credentials,
    messaging,
)


def initialize_firebase():

    if firebase_admin._apps:
        return

    credentials_path = os.environ.get(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )

    if not credentials_path:
        raise RuntimeError(
            "GOOGLE_APPLICATION_CREDENTIALS "
            "is not configured"
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
    conversation_id: str = None,
):

    initialize_firebase()

    data = {
        "title": title,
        "body": body,
        "url": url,
    }

    if conversation_id:
        data["conversation_id"] = conversation_id

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data,
        token=installation_id,
    )

    return messaging.send(message)