# Environment Variables

The backend application requires an environment file (`backend/.env`) to run. The frontend does not require any environment variables out-of-the-box as it defaults to `http://localhost:5000/api`.

## Backend `.env` File Overview

### Server Configuration
- **`PORT`**
  - **Required**: No
  - **Default**: `5000`
  - **Example**: `5000`
  - **Purpose**: Defines the HTTP port the Express server listens on.
  - **Failure impact**: If missing, it safely falls back to `5000`.

### Database Configuration
- **`MONGO_URI`**
  - **Required**: Yes
  - **Example**: `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0`
  - **Purpose**: Defines the connection string for MongoDB.
  - **Failure impact**: The server will crash on startup if missing or invalid because `mongoose.connect()` is strictly required in `config/db.js`.

- **`REDIS_HOST`**, **`REDIS_PORT`**, **`REDIS_USERNAME`**, **`REDIS_PASSWORD`**
  - **Required**: Yes
  - **Example**: `REDIS_HOST=straw-crown.db.redis.io`, `REDIS_PORT=19080`
  - **Purpose**: Defines the connection to the Redis cache. Used primarily for managing background job queues (like rate-limited fetching) and session tracking.
  - **Failure impact**: Background workers (like BullMQ/Bull) will throw connection errors and news collection will fail.

### Security
- **`JWT_SECRET`**
  - **Required**: Yes
  - **Example**: `your_super_secret_jwt_key`
  - **Purpose**: Cryptographic key used to sign and verify JSON Web Tokens for user authentication.
  - **Failure impact**: Users will be unable to log in, register, or access any protected `/api/` endpoints.

### Artificial Intelligence
- **`GEMINI_API_KEY`**
  - **Required**: Yes
  - **Example**: `AIzaSy...`
  - **Purpose**: Authenticates requests to the Google Generative AI (Gemini) endpoint.
  - **Failure impact**: The `aiService.js` will throw HTTP 400/401 errors. News will be fetched but the application will completely fail to evaluate, score, or summarize them, resulting in 0 saved articles.

### News API Providers
- **`NEWSDATA_API_KEY`**
  - **Required**: Yes
  - **Purpose**: Key for NewsData.io API.
- **`APITUBE_API_KEY`**
  - **Required**: Yes
  - **Purpose**: Key for ApiTube.io.
- **`NEWSAPI_API_KEY`**
  - **Required**: Yes
  - **Purpose**: Key for NewsAPI.org.
- **`MEDIASTACK_API_KEY`**
  - **Required**: Yes
  - **Purpose**: Key for MediaStack API.
  
*(Note: If any single news provider key is missing, `newsController.js` will catch the failure for that specific provider and log a warning, but the overall collection process will continue using the remaining providers.)*

---

## Sample `.env.example`

Create a file named `.env` in the `backend/` directory and copy the contents below:

```ini
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/ai_news_db

# Redis Config
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=

# Security
JWT_SECRET=replace_me_with_a_secure_random_string

# AI Keys
GEMINI_API_KEY=

# News API Keys
NEWSDATA_API_KEY=
APITUBE_API_KEY=
NEWSAPI_API_KEY=
MEDIASTACK_API_KEY=
```
