from fastapi import FastAPI
from .routers import board_router, user_router, list_router, member_router, card_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)
app.include_router(board_router.router)
app.include_router(list_router.router)
app.include_router(member_router.router)
app.include_router(card_router.router)

@app.get("/")
def read_root():
    return {"message": "API is running"}