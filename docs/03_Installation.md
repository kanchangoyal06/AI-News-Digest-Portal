# Installation Guide

Follow these steps to set up the AI News Digest Portal on your local development machine. The project is split into two distinct applications: a Node.js `backend` and a React `frontend`.

## 1. Backend Setup
The backend is an Express API that connects to MongoDB and Redis.

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```
Open the `.env` file in your code editor and populate it with your actual database strings and API keys (See `04_Environment_Variables.md` for details).

### Start the Backend
```bash
# For development (auto-restarts on file changes)
npm run dev

# For production
npm start
```
*You should see a message in the terminal indicating `Server started on port 5000` and `✅ MongoDB Connected`.*

## 2. Frontend Setup
The frontend is a React Single Page Application powered by Vite.

```bash
# Open a new terminal window/tab
# Navigate to the frontend folder from the project root
cd frontend

# Install dependencies
npm install
```

### Configure Frontend API Connection
The frontend uses an Axios instance that expects the backend to run on `http://localhost:5000/api`. If you change your backend port, you must update the base URL in `frontend/src/api/axios.js`.

### Start the Frontend
```bash
# Run the Vite development server
npm run dev
```
*The terminal will output a local link, typically `http://localhost:5173`. Open this in your browser.*

## 3. Initial Application Boot
1. Navigate to `http://localhost:5173` in your browser.
2. Click on **Register** to create your first admin account.
3. Upon successful registration, you will be automatically logged in and redirected to the Dashboard.
4. Go to **Settings** to configure the AI Prompt and default receiver emails if desired.
