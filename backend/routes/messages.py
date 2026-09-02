import uuid
from datetime import datetime, timezone

from utils.firebase import send_push_notification

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from config.database import db
from models.message import MessageInput
from dependencies.auth import get_current_user



router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)




# =====================================================
# HELPER
# =====================================================

def make_conversation_id(item_id: str, user1_id: str, user2_id: str) -> str:
    """
    Creates the same conversation ID regardless of
    which user is first.

    Example:

    Hulk + Spider
    Spider + Hulk

    Both produce the same conversation ID.
    """

    users = sorted([user1_id, user2_id])

    return f"{item_id}:{users[0]}:{users[1]}"


# =====================================================
# SEND MESSAGE
# =====================================================

@router.post("")
async def send_message(
    payload: MessageInput,
    user: dict = Depends(get_current_user)
):

    message_text = payload.message.strip()

    if not message_text:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    # =================================================
    # FIND ITEM
    # =================================================

    item = await db.items.find_one({
        "id": payload.item_id
    })

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    item_owner_id = item.get("user_id")

    if not item_owner_id:
        raise HTTPException(
            status_code=400,
            detail="Item owner not found"
        )

    # =================================================
    # DETERMINE RECEIVER + CONVERSATION
    # =================================================

    # -------------------------------------------------
    # CASE 1:
    # Current user is NOT the item owner
    #
    # Example:
    # Spider -> Hulk
    # -------------------------------------------------

    if user["id"] != item_owner_id:

        receiver_id = item_owner_id

        receiver_name = item.get(
            "user_name",
            "User"
        )

        conversation_id = make_conversation_id(
            payload.item_id,
            user["id"],
            receiver_id
        )

    # -------------------------------------------------
    # CASE 2:
    # Current user IS the item owner
    #
    # Example:
    # Hulk -> Spider
    #
    # The frontend MUST provide the conversation_id.
    # -------------------------------------------------

    else:

        if not payload.conversation_id:
            raise HTTPException(
                status_code=400,
                detail="Conversation ID is required when replying"
            )

        conversation_id = payload.conversation_id

        # Find an existing message belonging to this conversation
        previous_message = await db.messages.find_one({
            "conversation_id": conversation_id,
            "$or": [
                {"sender_id": user["id"]},
                {"receiver_id": user["id"]}
            ]
        })

        if not previous_message:
            raise HTTPException(
                status_code=400,
                detail="Conversation not found"
            )

        # Make sure this conversation actually belongs
        # to the logged-in item owner.
        if (
            previous_message["sender_id"] != user["id"]
            and previous_message["receiver_id"] != user["id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not part of this conversation"
            )

        # The other participant becomes the receiver.
        if previous_message["sender_id"] == user["id"]:
            receiver_id = previous_message["receiver_id"]
            receiver_name = previous_message.get(
                "receiver_name",
                "User"
            )
        else:
            receiver_id = previous_message["sender_id"]
            receiver_name = previous_message.get(
                "sender_name",
                "User"
            )

    # =================================================
    # SAFETY CHECK
    # =================================================

    if receiver_id == user["id"]:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a message to yourself"
        )

    # =================================================
    # CREATE MESSAGE
    # =================================================

    message_doc = {
        "id": str(uuid.uuid4()),

        # Item
        "item_id": payload.item_id,
        "item_title": item.get(
            "title",
            "Item"
        ),

        # Conversation
        "conversation_id": conversation_id,

        # Sender
        "sender_id": user["id"],
        "sender_name": user["name"],

        # Receiver
        "receiver_id": receiver_id,
        "receiver_name": receiver_name,

        # Message
        "message": message_text,

        # Time
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),

        # Unread
        "read": False,
    }

    # =================================================
# SAVE TO DATABASE
# =================================================

    await db.messages.insert_one(message_doc)

    


    receiver = await db.users.find_one(
    {"id": receiver_id},
    {
        "_id": 0,
        "fcm_installations": 1,
    }
)

    installations = (
    receiver.get(
        "fcm_installations",
        []
    )
    if receiver
    else []
)

    for installation_id in installations:
        try:

            send_push_notification(
            installation_id=installation_id,
            title=(
                f"{user['name']} "
                f"sent you a message"
            ),
            body=message_text,
            url="/messages",
            conversation_id=conversation_id,
        )

        except Exception as e:

            print(
            f"FCM notification failed: {e}"
        )






# =================================================
# RETURN RESPONSE
# =================================================

    message_doc.pop(
     "_id",
        None
    )

    return {
        "success": True,
        "message": message_doc
}

    


# =====================================================
# GET MY MESSAGES
# =====================================================

@router.get("")
async def get_my_messages(
    user: dict = Depends(get_current_user)
):

    cursor = db.messages.find(
        {
            "$or": [
                {
                    "sender_id": user["id"]
                },
                {
                    "receiver_id": user["id"]
                }
            ]
        },
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        1
    )

    messages = await cursor.to_list(
        length=1000
    )

    return messages


# =====================================================
# UNREAD MESSAGE COUNT
# =====================================================

@router.get("/unread-count")
async def get_unread_message_count(
    user: dict = Depends(get_current_user)
):

    count = await db.messages.count_documents({
        "receiver_id": user["id"],
        "read": {
            "$ne": True
        }
    })

    return {
        "count": count
    }


# =====================================================
# MARK CONVERSATION AS READ
# =====================================================

@router.put("/conversation/{conversation_id}/read")
async def mark_messages_as_read(
    conversation_id: str,
    user: dict = Depends(get_current_user)
):

    result = await db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "receiver_id": user["id"],
            "read": {
                "$ne": True
            }
        },
        {
            "$set": {
                "read": True
            }
        }
    )

    return {
        "success": True,
        "marked_read": result.modified_count
    }


# =====================================================
# GET CONVERSATION
# =====================================================

@router.get("/conversation/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user)
):

    cursor = db.messages.find(
        {
            "conversation_id": conversation_id,
            "$or": [
                {
                    "sender_id": user["id"]
                },
                {
                    "receiver_id": user["id"]
                }
            ]
        },
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        1
    )

    messages = await cursor.to_list(
        length=500
    )

    return messages