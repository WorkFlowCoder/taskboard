from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user_router

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplacez par les origines spécifiques si nécessaire
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router.router)