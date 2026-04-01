# TaskBoard Docker Project

## Description

TaskBoard is a Trello-inspired task management application, built as a full-stack project with:

- Frontend: React + Vite
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL 15

The entire stack is containerized using Docker Compose for easy setup and development.

## Prerequisites

Docker Compose v2 (included in Docker Desktop)
If using WSL, Docker commands may require sudo if your user is not in the Docker group.

### Project Structure

```bash
taskboard/
│
├─ backend/             # FastAPI + SQLAlchemy
├─ frontend/            # React + Vite
├─ docker-compose.yml
└─ README.md
```

## Docker Configuration

The docker-compose.yml includes:

db: PostgreSQL 15
backend: image built from ./backend
frontend: image built from ./frontend

Volumes are mounted for data persistence and hot-reload during development.

## Installation & Launch

### 1️. Start the stack

With root permissions (if user not added to Docker group):

```bash
sudo docker compose up --build
```

Or in detached mode:

```bash
sudo docker compose up -d --build
```

### 2. Check running containers

```bash
sudo docker compose ps
```

### 3. View logs

```bash
sudo docker compose logs -f
```

### 4. Stop the stack

```bash
sudo docker compose down
```

## Usage

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
