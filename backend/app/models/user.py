from sqlalchemy import Column, Integer, String, TIMESTAMP
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    modified_at = Column(TIMESTAMP, default=datetime.utcnow)