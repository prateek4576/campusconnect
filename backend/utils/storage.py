import os
import logging
import requests

from typing import Optional

from fastapi import HTTPException


logger = logging.getLogger(__name__)


# =====================================================
# OBJECT STORAGE
# =====================================================

STORAGE_URL = (
    "https://integrations.emergentagent.com/"
    "objstore/api/v1/storage"
)

EMERGENT_KEY = os.environ.get(
    "EMERGENT_LLM_KEY"
)

APP_NAME = "campusconnect"

storage_key: Optional[str] = None


# =====================================================
# INITIALIZE STORAGE
# =====================================================

def init_storage():

    global storage_key

    # Already initialized
    if storage_key:
        return storage_key

    try:

        response = requests.post(
            f"{STORAGE_URL}/init",
            json={
                "emergent_key": EMERGENT_KEY
            },
            timeout=30
        )

        response.raise_for_status()

        storage_key = response.json()[
            "storage_key"
        ]

        logger.info(
            "Storage initialized"
        )

    except Exception as e:

        logger.error(
            f"Storage init failed: {e}"
        )

        storage_key = None

    return storage_key


# =====================================================
# UPLOAD OBJECT
# =====================================================

def put_object(
    path: str,
    data: bytes,
    content_type: str
) -> dict:

    global storage_key

    key = init_storage()

    if not key:

        raise HTTPException(
            status_code=500,
            detail="Storage not available"
        )

    response = requests.put(
        f"{STORAGE_URL}/objects/{path}",

        headers={
            "X-Storage-Key": key,
            "Content-Type": content_type
        },

        data=data,

        timeout=120
    )

    # -------------------------------------------------
    # Storage key expired
    # -------------------------------------------------

    if response.status_code == 403:

        storage_key = None

        key = init_storage()

        response = requests.put(
            f"{STORAGE_URL}/objects/{path}",

            headers={
                "X-Storage-Key": key,
                "Content-Type": content_type
            },

            data=data,

            timeout=120
        )

    response.raise_for_status()

    return response.json()


# =====================================================
# GET OBJECT
# =====================================================

def get_object(
    path: str
):

    global storage_key

    key = init_storage()

    if not key:

        raise HTTPException(
            status_code=500,
            detail="Storage not available"
        )

    response = requests.get(
        f"{STORAGE_URL}/objects/{path}",

        headers={
            "X-Storage-Key": key
        },

        timeout=60
    )

    # -------------------------------------------------
    # Storage key expired
    # -------------------------------------------------

    if response.status_code == 403:

        storage_key = None

        key = init_storage()

        response = requests.get(
            f"{STORAGE_URL}/objects/{path}",

            headers={
                "X-Storage-Key": key
            },

            timeout=60
        )

    response.raise_for_status()

    return (
        response.content,
        response.headers.get(
            "Content-Type",
            "application/octet-stream"
        )
    )