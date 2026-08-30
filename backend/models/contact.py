from pydantic import BaseModel, EmailStr


# =====================================================
# CONTACT / FEEDBACK
# =====================================================

class ContactInput(BaseModel):
    name: str
    email: EmailStr
    type: str
    message: str