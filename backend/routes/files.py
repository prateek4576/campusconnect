import io
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
from dependencies.auth import get_current_user
from utils.cloudinary import upload_image


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

    # -------------------------------------------------
    # Validate file type
    # -------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WebP images are allowed"
        )

    # -------------------------------------------------
    # Read file
    # -------------------------------------------------

    data = await file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Empty image file"
        )

    # -------------------------------------------------
    # Original upload safety limit
    # -------------------------------------------------

    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large (max 5MB)"
        )

    # -------------------------------------------------
    # Upload to Cloudinary
    # -------------------------------------------------

    try:

        result = upload_image(
            io.BytesIO(data),
            file.filename or "image"
        )

    except Exception as e:

        print(
            f"Cloudinary upload failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Image upload failed"
        )

    image_url = result.get("url")

    if not image_url:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary did not return an image URL"
        )

    # -------------------------------------------------
    # Save metadata
    # -------------------------------------------------

    file_id = str(uuid.uuid4())

    await db.files.insert_one({
        "id": file_id,

        # Cloudinary
        "storage_provider": "cloudinary",
        "cloudinary_url": image_url,
        "cloudinary_public_id": result.get("public_id"),

        # Original information
        "original_filename": file.filename,
        "content_type": file.content_type,

        # Cloudinary image information
        "size": result.get("bytes", len(data)),
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),

        "user_id": user["id"],
        "is_deleted": False,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    })

    # -------------------------------------------------
    # Return Cloudinary URL
    # -------------------------------------------------

    return {
        "path": image_url,
        "url": image_url,
    }