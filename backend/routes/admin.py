import os
import uuid
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

from config.database import db

from models.auth import (
    AdminLoginInput,
    AdminUserUpdate,
)

from models.item import AdminItemUpdate

from dependencies.auth import get_current_admin

from utils.auth import create_admin_token

from utils.storage import put_object


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =====================================================
# ADMIN LOGIN
# =====================================================

@router.post("/login")
async def admin_login(
    payload: AdminLoginInput
):

    admin_id = os.environ.get(
        "ADMIN_ID"
    )

    admin_password = os.environ.get(
        "ADMIN_PASSWORD"
    )

    if not admin_id or not admin_password:

        raise HTTPException(
            status_code=500,
            detail="Admin credentials are not configured"
        )

    if (
        payload.admin_id != admin_id
        or payload.password != admin_password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials"
        )

    token = create_admin_token()

    return {
        "token": token,
        "admin_id": admin_id
    }


# =====================================================
# ADMIN - USERS
# =====================================================

@router.get("/users")
async def admin_get_users(
    admin: dict = Depends(get_current_admin)
):

    cursor = db.users.find(
        {},
        {
            "_id": 0,
            "password_hash": 0
        }
    ).sort(
        "created_at",
        -1
    )

    users = await cursor.to_list(
        length=500
    )

    # Get total number of posts for each user
    post_counts = await db.items.aggregate([
        {
            "$group": {
                "_id": "$user_id",
                "post_count": {
                    "$sum": 1
                }
            }
        }
    ]).to_list(length=5000)

    # Convert counts into an easy lookup dictionary
    post_count_map = {
        item["_id"]: item["post_count"]
        for item in post_counts
    }

    # Add post_count to every user
    for user in users:
        user["post_count"] = post_count_map.get(
            user["id"],
            0
        )

    return users


# =====================================================
# UPDATE USER
# =====================================================

@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    payload: AdminUserUpdate,
    admin: dict = Depends(get_current_admin)
):

    result = await db.users.update_one(
        {
            "id": user_id
        },
        {
            "$set": {
                "name": payload.name.strip(),
                "email": payload.email.lower().strip(),
                "phone": payload.phone.strip(),
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user = await db.users.find_one(
        {
            "id": user_id
        },
        {
            "_id": 0,
            "password_hash": 0
        }
    )

    return user


# =====================================================
# DELETE USER
# =====================================================

@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    admin: dict = Depends(get_current_admin)
):

    result = await db.users.delete_one(
        {
            "id": user_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Delete all posts
    await db.items.delete_many(
        {
            "user_id": user_id
        }
    )

    return {
        "message": "User deleted successfully"
    }


# =====================================================
# ADMIN - FEEDBACKS
# =====================================================

@router.get("/feedbacks")
async def admin_get_feedbacks(
    admin: dict = Depends(get_current_admin)
):

    cursor = db.feedbacks.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        -1
    )

    feedbacks = await cursor.to_list(
        length=500
    )

    return feedbacks


# =====================================================
# DELETE FEEDBACK
# =====================================================

@router.delete("/feedbacks/{feedback_id}")
async def admin_delete_feedback(
    feedback_id: str,
    admin: dict = Depends(get_current_admin)
):

    result = await db.feedbacks.delete_one(
        {
            "id": feedback_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    return {
        "message": "Feedback deleted successfully"
    }


# =====================================================
# ADMIN - ITEMS
# =====================================================

@router.get("/items")
async def admin_get_items(
    admin: dict = Depends(get_current_admin)
):

    cursor = db.items.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        -1
    )

    items = await cursor.to_list(
        length=500
    )

    return items


# =====================================================
# UPDATE ITEM
# =====================================================

@router.put("/items/{item_id}")
async def admin_update_item(
    item_id: str,
    payload: AdminItemUpdate,
    admin: dict = Depends(get_current_admin)
):

    result = await db.items.update_one(
        {
            "id": item_id
        },
        {
            "$set": {
                "title": payload.title.strip(),
                "description": payload.description.strip(),
                "category": payload.category.strip(),
                "location": payload.location.strip(),
                "date": payload.date,
                "type": payload.type,
                "status": payload.status,
                "image_path": payload.image_path,
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    item = await db.items.find_one(
        {
            "id": item_id
        },
        {
            "_id": 0
        }
    )

    return item


# =====================================================
# DELETE ITEM
# =====================================================

@router.delete("/items/{item_id}")
async def admin_delete_item(
    item_id: str,
    admin: dict = Depends(get_current_admin)
):

    result = await db.items.delete_one(
        {
            "id": item_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return {
        "message": "Item deleted successfully"
    }


# =====================================================
# ADMIN UPLOAD
# =====================================================

@router.post("/upload")
async def admin_upload(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):

    ext = (
        file.filename.split(".")[-1]
        if file.filename and "." in file.filename
        else "bin"
    ).lower()

    if ext not in [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only image files allowed"
        )

    data = await file.read()

    if len(data) > 5 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="File too large (max 5MB)"
        )

    content_type = (
        file.content_type
        or f"image/{ext}"
    )

    path = (
        f"campusconnect/"
        f"admin-uploads/"
        f"{uuid.uuid4()}.{ext}"
    )

    result = put_object(
        path,
        data,
        content_type
    )

    await db.files.insert_one({
        "id": str(uuid.uuid4()),

        "storage_path": result["path"],

        "original_filename": file.filename,

        "content_type": content_type,

        "size": result.get(
            "size",
            len(data)
        ),

        "user_id": "admin",

        "is_deleted": False,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    })

    return {
        "path": result["path"]
    }