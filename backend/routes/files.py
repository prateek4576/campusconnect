import uuid
from utils.storage import put_object, get_object
from dependencies.auth import get_current_user, get_current_admin
from datetime import datetime, timezone
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

from fastapi.responses import Response as FastAPIResponse

from config.database import db
from dependencies.auth import get_current_user
from utils.storage import put_object, get_object


router = APIRouter(
    tags=["Files"]
)


# =====================================================
# UPLOAD
# =====================================================

@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
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
        f"campusconnect/uploads/"
        f"{user['id']}/"
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
        "user_id": user["id"],
        "is_deleted": False,
        "created_at": datetime.now(
    timezone.utc
).isoformat(),
    })

    return {
        "path": result["path"]
    }


# =====================================================
# DOWNLOAD / VIEW FILE
# =====================================================

@router.get("/files/{path:path}")
async def download(
    path: str
):

    record = await db.files.find_one(
        {
            "storage_path": path,
            "is_deleted": False
        }
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    data, content_type = get_object(
        path
    )

    return FastAPIResponse(
        content=data,
        media_type=record.get(
            "content_type",
            content_type
        )
    )