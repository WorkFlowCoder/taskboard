from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Label(Base):
    __tablename__ = 'labels'

    label_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    color = Column(String(20))
    board_id = Column(Integer, ForeignKey('boards.board_id', ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint('board_id', 'title', name='_board_label_uc'),
    )

    board = relationship("Board", back_populates="labels")
    cards = relationship("Card", secondary="card_labels", back_populates="labels")