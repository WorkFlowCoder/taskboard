from sqlalchemy import Column, Integer, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Comment(Base):
    __tablename__ = 'comments'

    comment_id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    modified_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"))
    card_id = Column(Integer, ForeignKey('cards.card_id', ondelete="CASCADE"))

    author = relationship("User", back_populates="comments")
    card = relationship("Card", back_populates="comments")