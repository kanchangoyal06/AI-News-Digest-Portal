# Frontend Documentation

The frontend is a React SPA built with Vite.

## 1. Global State Management
**`src/store/useAuthStore.js`**
- Uses `zustand`.
- Stores the `userInfo` object containing the JWT token and user profile.
- Provides `login()` and `logout()` setter actions.
- Automatically persists to `localStorage`.

## 2. API Interceptor
**`src/api/axios.js`**
- Configures Axios with a base URL (`http://localhost:5000/api`).
- Injects an interceptor that reads the JWT from `localStorage` (via the zustand auth state) and attaches it as a `Bearer` token to every outgoing request.

## 3. Main Views (`src/pages/`)

### `Dashboard.jsx`
- **Purpose**: The core workspace for viewing curated news.
- **State**:
  - `isPolling`: Boolean tracking if the background news collection is active.
  - `blobUrls`: Dictionary mapping date strings to local memory Blob URLs (for redownloading EMLs).
- **Hooks**:
  - `useQuery` (Tanstack React Query) to fetch `/news`.
  - `useEffect` to manage a `setInterval` that polls `/news/status` every 5 seconds when `isPolling` is true.
- **Interactions**:
  - Groups fetched articles by date format (`MMM dd, yyyy`).
  - Renders a "Download Top 5 Digest" button for every unique date group.
  - Calls `downloadGroupDigest(dateStr, articles)`, which isolates the top 5 articles, asks the backend to format an `.eml` blob, and creates a hidden anchor (`<a>`) click to auto-download the file.

### `Settings.jsx`
- **Purpose**: Admin configuration screen.
- **State**: `prompt` (String), `receiverEmails` (String array).
- **Hooks**: `useQuery` to load initial settings, `useMutation` to save them.
- **Interactions**: Allows users to tweak the AI's core behavior by editing the default system prompt, saving changes globally in MongoDB.

### `Login.jsx` & `Register.jsx`
- **Purpose**: Handles authentication.
- **Interactions**: Sends email/password to `/api/auth`, receives user profile, pushes to `useAuthStore`, and navigates user to the Dashboard.

## 4. Layout Shell
**`src/layouts/MainLayout.jsx`**
- Wraps all protected routes (Dashboard, Settings).
- Provides a persistent sidebar navigation menu utilizing `lucide-react` icons.
- Executes `logout` and redirects to `/login`.
