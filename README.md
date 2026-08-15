# AI News Digest Portal

An enterprise-ready internal portal that collects AI-related news from trusted sources, uses the Gemini API to analyze and summarize them, and allows administrators to review and dispatch selected news to team members via email.

## Features
- **Automated Collection**: Scrapes configured RSS feeds and websites.
- **AI Processing**: Uses Google Gemini API to determine relevance, assign importance scores, and generate concise summaries.
- **Duplicate Detection**: Ready for MongoDB Vector Search integration to group similar news stories.
- **Admin Dashboard**: Modern React UI to review, filter, and manually approve summaries.
- **Email Delivery**: Uses Nodemailer (configurable with SendGrid/AWS SES) to send professional HTML digests.
- **Robust Scheduling**: Uses BullMQ with Redis to ensure jobs don't overlap across horizontal scaling.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Zustand, React Query
- **Backend**: Node.js, Express.js, BullMQ, Mongoose
- **Database**: MongoDB (Atlas Recommended), Redis (for task queues)
- **AI**: `@google/genai` (Gemini API)
- **Deployment**: Docker Compose

## Quick Start (Docker)

1. Clone the repository.
2. Setup environment variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in the values (especially `GEMINI_API_KEY` and `SMTP` settings).
   - Copy `frontend/.env.example` to `frontend/.env`.
3. Run with Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
4. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

## Local Development (Without Docker)

1. Ensure **MongoDB** and **Redis** are running locally.
2. Setup Backend:
   ```bash
   cd backend
   npm install
   npm run start
   ```
3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Initial Setup
On the first run, you will need to register an initial Admin user by calling the `POST /api/auth/register` endpoint manually (e.g., via Postman) since there is no public registration page by design.
