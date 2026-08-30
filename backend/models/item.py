from typing import Optional

from pydantic import BaseModel


# =====================================================
# CREATE ITEM
# =====================================================

class ItemInput(BaseModel):
    title: str
    description: str
    category: str
    location: str
    date: str
    image_path: Optional[str] = None


# =====================================================
# USER UPDATE ITEM
# =====================================================

class UserItemUpdate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    date: str
    status: str = "open"
    image_path: Optional[str] = None


# =====================================================
# ADMIN UPDATE ITEM
# =====================================================

class AdminItemUpdate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    date: str
    type: str
    status: str = "open"
    image_path: Optional[str] = None