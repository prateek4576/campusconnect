from typing import Optional
from pydantic import BaseModel, EmailStr





# =====================================================
# LOGIN
# =====================================================

class LoginInput(BaseModel):
    email: EmailStr
    password: str


# =====================================================
# ADMIN AUTHENTICATION
# =====================================================

class AdminLoginInput(BaseModel):
    admin_id: str
    password: str


# =====================================================
# ADMIN USER UPDATE
# =====================================================

class AdminUserUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str


# =====================================================
# USER PROFILE UPDATE
# =====================================================

class UserProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str




# =====================================================
# MANUAL REGISTRATION
# =====================================================

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


# =====================================================
# GOOGLE AUTHENTICATION
# =====================================================

class GoogleLoginInput(BaseModel):
    credential: str