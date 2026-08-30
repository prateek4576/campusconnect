from typing import Optional
from pydantic import BaseModel


# =====================================================
# SEND MESSAGE
# =====================================================

class MessageInput(BaseModel):
    item_id: str
    message: str
    conversation_id: Optional[str] = None