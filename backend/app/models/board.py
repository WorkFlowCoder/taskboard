from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Board(Base):
    __tablename__ = 'boards'

    board_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    modified_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relations
    owner = relationship("User", back_populates="boards_owned")
    lists = relationship("List", back_populates="board", cascade="all, delete")
    members = relationship("BoardMember", back_populates="board", cascade="all, delete")
    labels = relationship("Label", back_populates="board", cascade="all, delete")