import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    BackgroundTasks,
)

from config.database import db
from models.item import (
    ItemInput,
    UserItemUpdate,
)

from dependencies.auth import get_current_user
from utils.firebase import send_new_item_notification


router = APIRouter(
    prefix="/items",
    tags=["Items"]
)


# =====================================================
# HELPER
# =====================================================

def item_from_doc(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


# =====================================================
# CREATE ITEM
# =====================================================

async def create_item(
    item_type: str,
    payload: ItemInput,
    user: dict,
    background_tasks: BackgroundTasks
) -> dict:

    doc = {
        "id": str(uuid.uuid4()),
        "type": item_type,
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "category": payload.category.strip(),
        "location": payload.location.strip(),
        "date": payload.date,
        "image_path": payload.image_path,

        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "user_phone": user.get("phone", ""),

        "status": "open",

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    # Save item
    await db.items.insert_one(doc)

    # =================================================
    # SEND NEW ITEM PUSH NOTIFICATION
    # =================================================

    users_cursor = db.users.find(
        {
            "id": {
                "$ne": user["id"]
            },
            "fcm_installations": {
                "$exists": True,
                "$ne": []
            }
        },
        {
            "_id": 0,
            "fcm_installations": 1
        }
    )

    users = await users_cursor.to_list(
        length=1000
    )

    for recipient in users:

        installations = recipient.get(
            "fcm_installations",
        []
    )

    for installation_id in installations:

        background_tasks.add_task(
            send_new_item_notification,
            installation_id,
            item_type,
            doc["title"],
            doc["location"],
            doc["id"],
        )

    return item_from_doc(doc)


# =====================================================
# REPORT LOST
# =====================================================

@router.post("/lost")
async def report_lost(
    payload: ItemInput,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    return await create_item(
        "lost",
        payload,
        user,
        background_tasks
    )


# =====================================================
# REPORT FOUND
# =====================================================

@router.post("/found")
async def report_found(
    payload: ItemInput,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    return await create_item(
        "found",
        payload,
        user,
        background_tasks
    )


# =====================================================
# GET ITEMS
# =====================================================

@router.get("")
async def list_items(
    type: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
):

    query = {}

    if type in ("lost", "found"):
        query["type"] = type

    if q:
        query["$or"] = [
            {
                "title": {
                    "$regex": q,
                    "$options": "i"
                }
            },
            {
                "description": {
                    "$regex": q,
                    "$options": "i"
                }
            },
            {
                "category": {
                    "$regex": q,
                    "$options": "i"
                }
            },
            {
                "location": {
                    "$regex": q,
                    "$options": "i"
                }
            }
        ]

    cursor = db.items.find(
        query,
        {
            "_id": 0,

            # IMPORTANT:
            # Do not expose contact information
            "user_email": 0,
            "user_phone": 0
        }
    ).sort(
        "created_at",
        -1
    ).limit(200)

    items = await cursor.to_list(
        length=200
    )

    return items


# =====================================================
# MY ITEMS
# =====================================================

@router.get("/mine")
async def list_my_items(
    user: dict = Depends(get_current_user)
):

    cursor = db.items.find(
        {
            "user_id": user["id"]
        },
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        -1
    )

    items = await cursor.to_list(
        length=200
    )

    return items


# =====================================================
# UPDATE MY ITEM
# =====================================================

@router.put("/{item_id}")
async def update_my_item(
    item_id: str,
    payload: UserItemUpdate,
    user: dict = Depends(get_current_user)
):

    result = await db.items.update_one(
        {
            "id": item_id,
            "user_id": user["id"]
        },
        {
            "$set": {
    "title": payload.title.strip(),
    "description": payload.description.strip(),
    "category": payload.category.strip(),
    "location": payload.location.strip(),
    "date": payload.date,
    "status": payload.status.lower().strip(),
    "image_path": payload.image_path
}
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    updated_item = await db.items.find_one(
        {
            "id": item_id,
            "user_id": user["id"]
        },
        {
            "_id": 0
        }
    )

    return updated_item


# =====================================================
# DELETE MY ITEM
# =====================================================

@router.delete("/{item_id}")
async def delete_my_item(
    item_id: str,
    user: dict = Depends(get_current_user)
):

    result = await db.items.delete_one(
        {
            "id": item_id,
            "user_id": user["id"]
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )

    return {
        "message": "Post deleted successfully"
    }


# =====================================================
# ITEM STATS
# =====================================================

@router.get("/stats")
async def item_stats():

    lost_count = await db.items.count_documents({
        "type": "lost"
    })

    found_count = await db.items.count_documents({
        "type": "found"
    })

    users_count = await db.users.count_documents({})

    reunions_count = await db.items.count_documents({
        "status": "returned"
    })

    return {
        "lost": lost_count,
        "found": found_count,
        "reunions": reunions_count,
        "users": users_count
    }