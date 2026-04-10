# Moved UpdateRoleRequest to a dedicated schemas module for better code organization

# In a new file: backend/app/schemas/member.py
from pydantic import BaseModel, validator

class UpdateRoleRequest(BaseModel):
    new_role: str

    @validator("new_role")
    def validate_role(cls, value):
        if value not in ["admin", "member", "owner"]:
            raise ValueError("Invalid role. Role must be 'admin', 'member', or 'owner'.")
        return value