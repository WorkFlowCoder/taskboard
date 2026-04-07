from fastapi import FastAPI
from .routers import board_router, user_router, list_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",  # Origine du frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes pour les boards
app.include_router(board_router.router)

# Inclusion des routes pour les utilisateurs
app.include_router(user_router.router)

# Inclusion des routes pour la liste
app.include_router(list_router.router)