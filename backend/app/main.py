from fastapi import FastAPI
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from user import User

app = FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/test-read")
def read_users():
    db: Session = SessionLocal()
    users = db.query(User).all()
    return users