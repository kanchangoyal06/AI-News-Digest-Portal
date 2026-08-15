# Folder Structure

The repository is structured as a monorepo containing two distinct applications: `backend` and `frontend`. Below is a comprehensive breakdown of every significant folder and file.

```text
ai-news-digest-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Initializes MongoDB connection using mongoose.
│   │   ├── controllers/
│   │   │   ├── authController.js     # Handles login, registration, and JWT signing.
│   │   │   ├── digestController.js   # Generates .eml files from DB records.
│   │   │   ├── newsController.js     # Coordinates fetching, AI batching, and saving.
│   │   │   └── settingsController.js # Manages user preferences (prompts, receiver emails).
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js     # Validates JWT tokens and enforces Admin roles.
│   │   ├── models/
│   │   │   ├── Article.js            # Mongoose schema for curated news articles.
│   │   │   ├── Digest.js             # Mongoose schema logging .eml download events.
│   │   │   ├── Settings.js           # Mongoose schema for singleton app settings.
│   │   │   └── User.js               # Mongoose schema for accounts (includes bcrypt).
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Routes for /api/auth/*
│   │   │   ├── digestRoutes.js       # Routes for /api/digests/*
│   │   │   ├── newsRoutes.js         # Routes for /api/news/* (includes /collect and /status)
│   │   │   └── settingsRoutes.js     # Routes for /api/settings/*
│   │   ├── services/
│   │   │   ├── aiService.js          # Google Gemini integration, prompt building, JSON parsing.
│   │   │   └── emailService.js       # HTML template generation for the .eml file body.
│   │   └── index.js                  # Express server entry point, CORS config, route mounting.
│   ├── .env                          # Secret environment variables (DO NOT COMMIT).
│   └── package.json                  # Backend dependencies (express, mongoose, genai).
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Centralized Axios instance with JWT interceptors.
│   │   ├── assets/                   # Static images and icons.
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx        # Sidebar navigation shell wrapping all authenticated pages.
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main UI: Triggers collection, renders grouped news, auto-downloads.
│   │   │   ├── Login.jsx             # Authentication UI.
│   │   │   ├── Register.jsx          # New user onboarding.
│   │   │   └── Settings.jsx          # UI for configuring AI prompts and default emails.
│   │   ├── store/
│   │   │   └── useAuthStore.js       # Zustand global state for tracking current logged-in user.
│   │   ├── App.jsx                   # React Router definition (Public vs Protected routes).
│   │   ├── index.css                 # Tailwind CSS directives.
│   │   └── main.jsx                  # React DOM entry point, QueryClientProvider setup.
│   ├── tailwind.config.js            # Tailwind theme configurations.
│   ├── vite.config.js                # Vite build tool configuration.
│   └── package.json                  # Frontend dependencies (react, zustand, tailwind).
│
├── docs/                             # Project documentation (You are here).
└── README.md                         # High-level entry point pointing to the docs folder.
```

## Critical Rules for File Placement
- **Never store `.env` files in source control.** They contain live credentials.
- **Do not mix business logic with routes.** All `backend/src/routes/` files should only define HTTP paths and instantly map them to controllers.
- **Do not put direct external API calls in controllers.** For example, Gemini API code belongs strictly in `services/aiService.js`, keeping `newsController.js` abstracted.
- **Frontend State:** Local ephemeral state (like a modal opening) stays in the component (`useState`). Global persistent state (like the User object) belongs in `store/useAuthStore.js`. Data fetching state (loading, error, caching) belongs entirely to `@tanstack/react-query`.
