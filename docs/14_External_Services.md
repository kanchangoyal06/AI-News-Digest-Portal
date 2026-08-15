# External Services Integration

## Google Generative AI (Gemini)
The application relies heavily on `gemini-1.5-flash` to evaluate the quality of news.
- **Integration Point**: `backend/src/services/aiService.js`
- **Rate Limit Handling**: The Google API is notoriously strict with free-tier rate limits (both Requests-Per-Minute and Tokens-Per-Minute).
- **Implementation Strategy**: The backend implements "Chunking". It slices the array of 150+ raw articles into chunks of 5. It uses a `try/catch` block for each chunk. If a chunk hits a `503 Service Unavailable` or `429 Too Many Requests`, the code explicitly catches it, logs a warning (`Error processing batch: 503`), and skips that specific batch, ensuring the system does not crash and continues processing the rest of the chunks.

## News APIs
- **NewsAPI.org**: Excellent for top-tier journalism. However, their Developer Tier blocks `CORS` requests directly from a browser and occasionally blocks generic `localhost` server requests. The backend circumvents browser CORS by acting as a proxy server.
- **MediaStack**: Provides a massive volume of global news. The free tier does not support HTTPS `https://api.mediastack.com`. To prevent Axios from failing on secure environments, the endpoint is strictly hardcoded to `http://api.mediastack.com` within `newsController.js`.
- **NewsData.io & ApiTube**: Used to fill gaps and find niche AI startups that mainstream media ignores.

## External Resiliency
If any single news provider goes down or rotates its API keys, the system is designed to catch that specific provider's failure via `Promise.allSettled()` (conceptually) rather than crashing the entire collection loop. The AI will simply curate from the providers that successfully responded.
