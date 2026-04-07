from sqlalchemy import Column, Integer, ForeignKey, String, CheckConstraint
from app.database import Base

class BoardMember(Base):
    __tablename__ = "board_members"

    board_member_id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.board_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'member')", name="check_role"),
    )