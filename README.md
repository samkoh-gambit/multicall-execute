# MulticallBN Project Usage Guide

## 1. Running as a Script (Backend Only)

- Go to the `backend` directory.
- Follow the instructions in `backend/README.md`.
- This mode is for running scripts (like `execute.js`, `read.js`, `write.js`) directly using Node.js.
- The backend uses Express.js to expose API endpoints if needed.

---

## 2. Running as Fullstack (Frontend + Backend)

- Follow the instructions in both `frontend/README.md` and `backend/README.md`.
- The backend (`backend`) exposes API endpoints using Express.js.
- The frontend (`frontend`) is a React app that communicates with the backend via HTTP API calls.
- This setup is suitable for local development or when deploying backend and frontend separately (e.g., backend on Render, frontend on Vercel/Netlify).

---

## 3. Production Deployment on Vercel

- **Due to Vercel's limitations** (no long-running Express servers), the backend logic is included as a serverless function in the `frontend/api` directory.
- When deploying to Vercel:
  - The React frontend and API routes (backend logic) are deployed together as a single project.
  - The backend code is located in `frontend/api/execute.js` and runs as a Vercel serverless function.
- **Set all required environment variables in the Vercel dashboard** for both frontend and backend logic to work.

---

## Summary Table

| Mode                | How to Run/Deploy                | Backend Location      | Frontend Location   |
| ------------------- | -------------------------------- | --------------------- | ------------------- |
| Script/Backend Only | Node.js scripts in `/backend`    | `/backend`            | N/A                 |
| Fullstack (local)   | Express backend + React frontend | `/backend` (Express)  | `/frontend` (React) |
| Production (Vercel) | Vercel deploy of `/frontend`     | `/frontend/api` (API) | `/frontend` (React) |

---

**Tip:**

- For local development, use Express backend and React frontend separately.
- For production on Vercel, use the serverless function approach.
