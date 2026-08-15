# API Routes Documentation

All API routes are prefixed with `/api`.

## Authentication Routes (`/api/auth`)

### `POST /api/auth/register`
- **Purpose**: Creates a new user.
- **Request Body**: `{ name, email, password }`
- **Response**: `201 Created` with `{ _id, name, email, isAdmin, token }`
- **Middleware**: None.

### `POST /api/auth/login`
- **Purpose**: Authenticates a user and returns a JWT.
- **Request Body**: `{ email, password }`
- **Response**: `200 OK` with `{ _id, name, email, isAdmin, token }`
- **Errors**: `401 Unauthorized` if invalid email or password.

---

## News Routes (`/api/news`)

### `POST /api/news/collect`
- **Purpose**: Triggers the background data gathering and AI curation task.
- **Middleware**: `protect`, `admin`
- **Response**: `202 Accepted` with `{ message: "News collection started in background" }`
- **Side effects**: Triggers heavy HTTP requests to third-party news APIs and Gemini.

### `GET /api/news/status`
- **Purpose**: Polling endpoint for the frontend to check if the collection job is running.
- **Middleware**: `protect`, `admin`
- **Response**: `200 OK` with `{ isCollecting: boolean }`

### `GET /api/news`
- **Purpose**: Retrieves curated news from the database.
- **Query Params**: `limit` (default: 20), `timeframe` (optional).
- **Middleware**: `protect`
- **Response**: `200 OK` with `{ articles: [ ... ], page, pages, total }`

---

## Digest Routes (`/api/digests`)

### `POST /api/digests/download`
- **Purpose**: Generates and downloads the `.eml` draft containing the provided articles.
- **Request Body**: `{ articleIds: ["id1", "id2"] }`
- **Middleware**: `protect`, `admin`
- **Response**: `200 OK` Binary Blob (RFC 822 format / `message/rfc822`) with `Content-Disposition: attachment`.
- **Errors**: `400 Bad Request` if no IDs provided.

### `GET /api/digests`
- **Purpose**: Retrieves history of generated digests.
- **Middleware**: `protect`, `admin`
- **Response**: `200 OK` with `[ { _id, sentAt, articles: [], status } ]`

---

## Settings Routes (`/api/settings`)

### `GET /api/settings`
- **Purpose**: Fetch global application settings.
- **Middleware**: `protect`, `admin`
- **Response**: `200 OK` with `{ defaultPrompt, receiverEmails }`

### `PUT /api/settings`
- **Purpose**: Updates the settings singleton document.
- **Request Body**: `{ prompt, receiverEmails }`
- **Middleware**: `protect`, `admin`
- **Response**: `200 OK` with updated document.
