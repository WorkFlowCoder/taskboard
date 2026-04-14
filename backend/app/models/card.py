from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Tables d'association (Many-to-Many)
card_labels = Table(
    'card_labels',
    Base.metadata,
    Column('card_id', Integer, ForeignKey('cards.card_id', ondelete="CASCADE"), primary_key=True),
    Column('label_id', Integer, ForeignKey('labels.label_id', ondelete="CASCADE"), primary_key=True)
)

card_members = Table(
    'card_members',
    Base.metadata,
    Column('card_id', Integer, ForeignKey('cards.card_id', ondelete="CASCADE"), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True)
)

class Card(Base):
    __tablename__ = 'cards'

    card_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    position = Column(Integer, nullable=False)
    list_id = Column(Integer, ForeignKey('lists.list_id', ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    modified_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relations
    list = relationship("List", back_populates="cards")
    comments = relationship("Comment", back_populates="card", cascade="all, delete")
    labels = relationship("Label", secondary=card_labels, back_populates="cards")
    members = relationship("User", secondary=card_members, back_populates="cards")