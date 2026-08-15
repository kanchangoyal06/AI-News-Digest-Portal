# Backend Documentation

This document explains the core files and functions within the Express.js Node backend.

## 1. Core Entry Point (`index.js`)
- **Purpose**: Initializes the Express application, establishes middleware (CORS, JSON parsing), connects to MongoDB via `config/db.js`, mounts API routers, and starts the HTTP server.
- **Middleware Used**: `express.json()`, `cors()`.
- **Exported Functions**: None. It is the entry script.

## 2. Services (`src/services/`)

### `aiService.js`
- **Purpose**: Acts as a bridge between the application and Google's Gemini API.
- **Dependencies**: `@google/generative-ai`.
- **Exported Functions**:
  - `processArticlesBatchWithAI(articles, prompt, chunkIndex)`:
    - **Purpose**: Sends a chunk of raw articles to Gemini for scoring.
    - **Parameters**: `articles` (array), `prompt` (string representing system instructions), `chunkIndex` (number for logging).
    - **Return Value**: An array of objects containing `{ url, isAiRelated, summary, importanceScore, categories }`.
    - **External API Calls**: Hits `gemini-1.5-flash`.
    - **Exceptions Handled**: JSON parsing failures (retries parsing via regex if the AI wraps JSON in markdown blocks), timeouts, and 503 unavailability errors.

### `emailService.js`
- **Purpose**: Formats article data into readable HTML.
- **Exported Functions**:
  - `generateEmailHTML(articles)`:
    - **Purpose**: Converts a database array of articles into a styled HTML string representing an email body.

## 3. Controllers (`src/controllers/`)

### `newsController.js`
- **Purpose**: The largest controller handling the lifecycle of news aggregation.
- **Dependencies**: Axios, `aiService.js`, `Article` model.
- **Exported Functions**:
  - `collectNews(req, res)`:
    - **Purpose**: Triggered by the frontend to start the background aggregation job.
    - **Execution Flow**: Immediately returns a 202 Accepted. Then internally contacts 4 news APIs. Deduplicates URLs. Batches 5 items at a time and calls `processArticlesBatchWithAI`. Evaluates the JSON, filters out `isAiRelated: false`, sorts by `importanceScore`, and inserts the top 5 into the database.
    - **Side Effects**: Modifies global state variable `isCollecting`.
  - `getCollectionStatus(req, res)`:
    - **Purpose**: Returns `{ isCollecting: boolean }` so the frontend can poll.
  - `getArticles(req, res)`:
    - **Purpose**: Returns the 100 most recent articles from the MongoDB database, sorted by `publishedAt`.

### `digestController.js`
- **Purpose**: Generates `.eml` files.
- **Exported Functions**:
  - `downloadDigest(req, res)`:
    - **Purpose**: Takes an array of Article IDs, converts them to HTML, wraps them in EML RFC 822 format with `X-Unsent: 1`, and forces a file download.
    - **Database Changes**: Creates a new `Digest` log record (Status: "Downloaded"). Marks the specified `Article` records as "Sent".

### `authController.js`
- **Purpose**: User identity management.
- **Exported Functions**:
  - `registerUser(req, res)`: Hashes passwords and creates a new `User`. Returns JWT.
  - `authUser(req, res)`: Compares passwords. Returns JWT.
  
### `settingsController.js`
- **Purpose**: Manages singleton application settings (AI Prompt).
- **Exported Functions**:
  - `getSettings(req, res)`: Returns the single settings document.
  - `updateSettings(req, res)`: Applies updates to the AI prompt or receiver emails.

## 4. Middlewares (`src/middlewares/`)

### `authMiddleware.js`
- **Exported Functions**:
  - `protect(req, res, next)`: Extracts the Bearer token from the `Authorization` header, verifies it using `JWT_SECRET`, looks up the user in MongoDB, and attaches it to `req.user`. Throws 401 if invalid.
  - `admin(req, res, next)`: Verifies `req.user.isAdmin === true`. Throws 401 if false.
