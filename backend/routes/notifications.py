from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from config.database import db
from dependencies.auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/register")
async def register_notification(
    payload: dict,
    user: dict = Depends(get_current_user),
):
    installation_id = payload.get(
        "installation_id"
    )

    if not installation_id:
        raise HTTPException(
            status_code=400,
            detail="Installation ID is required"
        )

    await db.users.update_one(
        {
            "id": user["id"]
        },
        {
            "$addToSet": {
                "fcm_installations":
                    installation_id
            }
        }
    )

    return {
        "success": True
    }


@router.delete("/register")
async def unregister_notification(
    payload: dict,
    user: dict = Depends(get_current_user),
):
    installation_id = payload.get(
        "installation_id"
    )

    if not installation_id:
        raise HTTPException(
            status_code=400,
            detail="Installation ID is required"
        )

    await db.users.update_one(
        {
            "id": user["id"]
        },
        {
            "$pull": {
                "fcm_installations":
                    installation_id
            }
        }
    )

    return {
        "success": True
    }