# Security Architecture

## 1. Password Storage (bcryptjs)
Passwords are never stored in plain text. When a user registers or changes their password, a Mongoose `pre('save')` hook intercepts the document, generates a secure random salt, and hashes the password using `bcryptjs`. Any breach of the database will only reveal irreversible hashes.

## 2. Authentication Tokens (JWT)
JSON Web Tokens are used. They are cryptographically signed by the backend using the highly secretive `JWT_SECRET` environment variable. If a malicious actor alters a token payload, the cryptographic signature will fail validation in the `authMiddleware.js`, throwing a 401 error.

## 3. Cross-Origin Resource Sharing (CORS)
The backend explicitly enables CORS via the `cors()` middleware in `index.js`. In production, this should be tightly restricted to only allow requests originating from the production frontend domain (e.g., `https://frontend-domain.com`).

## 4. API Key Concealment
None of the external API keys (Gemini, NewsAPI, etc.) are ever exposed to the React frontend. The frontend simply asks the backend to "fetch news", and the backend securely applies its environment variables server-side before contacting third parties.

## 5. File Download Security
Browsers may flag `.eml` downloads dynamically generated via `blob:` URLs as "potentially unsafe". This is a standard browser heuristic against drive-by-downloads, and since the file is constructed locally by the user's trusted backend, it is 100% safe to retain.
