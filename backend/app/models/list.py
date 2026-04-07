from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class List(Base):
    __tablename__ = "lists"

    list_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    color = Column(String(20), nullable=False)
    position = Column(Integer, nullable=False)
    board_id = Column(Integer, ForeignKey("boards.board_id", ondelete="CASCADE"), nullable=False)