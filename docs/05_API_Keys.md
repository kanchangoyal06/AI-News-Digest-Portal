# API Keys & Third-Party Integrations

The AI News Digest Portal relies on several third-party services to function. Below is the documentation for each required service.

---

## Google Generative AI (Gemini)
- **Purpose**: Acts as the cognitive engine. Reads raw articles, evaluates their relevance to Artificial Intelligence, generates concise 3-sentence summaries, and assigns an Importance Score.
- **How to obtain**: Visit [Google AI Studio](https://aistudio.google.com/), sign in with a Google account, and click "Create API key".
- **Where to configure**: `backend/.env` -> `GEMINI_API_KEY`
- **Permissions required**: Standard API access (default).
- **Application usage**: Located in `backend/src/services/aiService.js`. The application sends a heavily engineered prompt alongside batches of 5 articles to the `gemini-1.5-flash` model.

---

## NewsAPI.org
- **Purpose**: Fetches real-time headlines from mainstream global news outlets (e.g., TechCrunch, Wired, NYTimes).
- **How to obtain**: Register at [NewsAPI.org](https://newsapi.org/register).
- **Where to configure**: `backend/.env` -> `NEWSAPI_API_KEY`
- **Permissions required**: Developer plan is sufficient for local development (limits to 100 requests/day and blocks localhost occasionally, but works for testing).
- **Application usage**: Fetched in `backend/src/controllers/newsController.js`. Queried with terms like `"artificial intelligence" OR "machine learning"`.

---

## MediaStack
- **Purpose**: Secondary global news API to ensure a diverse range of sources.
- **How to obtain**: Sign up at [MediaStack](https://mediastack.com/).
- **Where to configure**: `backend/.env` -> `MEDIASTACK_API_KEY`
- **Application usage**: Queried concurrently in `newsController.js`. Free tier does not support HTTPS encryption, so requests are routed via HTTP (note standard Node.js Axios behavior).

---

## NewsData.io
- **Purpose**: Extracts structured technological news data, particularly from smaller tech blogs.
- **How to obtain**: Create an account at [NewsData.io](https://newsdata.io/).
- **Where to configure**: `backend/.env` -> `NEWSDATA_API_KEY`
- **Application usage**: Queried concurrently in `newsController.js`. Limited to English language articles.

---

## ApiTube
- **Purpose**: A final supplementary news scraper API to catch any startup or niche AI news missed by the major providers.
- **How to obtain**: Obtain a key from [ApiTube](https://apitube.io/).
- **Where to configure**: `backend/.env` -> `APITUBE_API_KEY`
- **Application usage**: Queried concurrently in `newsController.js`.

---

*(Note: The system was previously integrated with SendGrid (SMTP) for direct email delivery, but this was deprecated in favor of generating local `.eml` files to bypass spam filters and SMTP rate limits.)*
