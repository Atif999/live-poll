# Live Poll App

A full-stack polling application that allows users to create polls, share them via a unique link, vote, and view live-updating results.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL

### Realtime Updates

* Server-Sent Events (SSE)

---

## Features

* Create a poll with 2–5 options
* Generate a shareable poll link
* Vote on a poll
* View poll results
* Live result updates
---

## Prerequisites

Make sure you have installed:

* Node.js (v20+ recommended)
* Docker Desktop(Windows) or Docker (Linux)

---

## Running Locally

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=4000
DATABASE_URL=postgresql://poll_user:poll_password@localhost:5432/live_poll
CORS_ORIGIN=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| POST   | `/api/polls`             | Create a poll       |
| GET    | `/api/polls/:id`         | Get poll details    |
| POST   | `/api/polls/:id/vote`    | Submit a vote       |
| GET    | `/api/polls/:id/results` | Get poll results    |
| GET    | `/api/polls/:id/stream`  | Live results stream |

---

## Deployment

The live poll casting app is deployed on vercel and you can visit it using the link below.

Link: https://live-poll-frontend-ochre.vercel.app/


---
