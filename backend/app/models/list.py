from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class List(Base):
    __tablename__ = 'lists'

    list_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    color = Column(String(20))
    position = Column(Integer, nullable=False)
    board_id = Column(Integer, ForeignKey('boards.board_id', ondelete="CASCADE"))

    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete")