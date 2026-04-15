from pydantic import BaseModel, field_validator, EmailStr

class UpdateRoleRequest(BaseModel):
    new_role: str

    @field_validator("new_role")
    @classmethod
    def validate_role(cls, value):
        allowed = ["admin", "member", "owner"]
        if value not in allowed:
            raise ValueError(f"Invalid role. Must be one of {allowed}")
        return value

class AddMemberRequest(BaseModel):
    email: EmailStr
    role: str

class AddedMemberResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    role: str