from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class BoardMember(Base):
    __tablename__ = 'board_members'

    board_member_id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey('boards.board_id', ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"))
    role = Column(String(20))

    __table_args__ = (
        CheckConstraint(role.in_(['admin', 'member']), name='check_role_type'),
    )

    board = relationship("Board", back_populates="members")