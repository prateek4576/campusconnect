from pydantic import BaseModel, EmailStr


# =====================================================
# EMAIL VERIFICATION / REGISTRATION
# =====================================================

class RequestVerificationInput(BaseModel):
    name: str
    email: EmailStr
    phone: str


class VerifyEmailInput(BaseModel):
    email: EmailStr
    otp: str


class CompleteRegistrationInput(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    verification_token: str


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
# OLD REGISTER MODEL
# =====================================================
# Keep this only if another part of your backend
# still imports RegisterInput.

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

    # =====================================================
# GOOGLE AUTHENTICATION
# =====================================================

class GoogleLoginInput(BaseModel):
    credential: str