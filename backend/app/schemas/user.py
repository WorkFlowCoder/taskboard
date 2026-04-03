from pydantic import BaseModel

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str