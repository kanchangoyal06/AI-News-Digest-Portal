# Error Handling & Recovery

## Controller-Level Handling
Every Express controller is wrapped in standard `try/catch` blocks.
When an asynchronous error occurs, it is caught and handled via a `res.status(500).json({ message: '...', error: error.message })` response.

## Axios Error Interception (Frontend)
The centralized `axios.js` file intercepts all responses from the backend.
If a `401 Unauthorized` is detected (meaning a JWT has expired or is invalid), the frontend could optionally trigger a global logout event, forcing the user back to the login screen. Otherwise, local components handle the errors using React Query's `isError` and `error` states to display beautiful UI alerts (via Tailwind).

## AI Fallback & Recovery Mechanisms
Google Gemini throws errors frequently when overwhelmed (503) or rate-limited (429).
In `aiService.js` and `newsController.js`:
- If the AI returns JSON wrapped in markdown tags (e.g., ` ```json [ ... ] ``` `), the service implements a Regex recovery block (`text.replace(/```json|```/g, '')`) to extract and parse the pure JSON safely.
- If the AI throws a hard 503 error, the catch block in the `for...of` chunking loop intentionally does **not** re-throw the error. Re-throwing would crash the entire collection loop. Instead, it logs the failure for that specific 5-article batch and gracefully `continue`s to the next batch. This guarantees that at least some news will be curated even during heavy API turbulence.

## Database Validation
Mongoose Enums enforce strict data boundaries.
For example, the `Digest` model strictly requires `status` to be `'Success'`, `'Failed'`, or `'Downloaded'`. If the controller attempts to pass an invalid string, Mongoose rejects the write at the database level and throws a ValidationError, which is safely returned as a 500 error to the client.
