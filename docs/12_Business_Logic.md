# Business Logic & Workflows

The main purpose of the application is to automate the extreme manual effort required to find, read, evaluate, and format news. Below is the detailed orchestration of the primary workflow.

## The Core Process: "News Collection"

1. **Trigger**
   - User clicks **"Fetch Latest News"** on the Dashboard.
   - Frontend sets `isPolling = true` and shows a spinning loader.
   - A `POST` request is sent to `/api/news/collect`.

2. **Backend Aggregation (The Feeders)**
   - The backend controller (`newsController.js`) receives the request. It returns a `202 Accepted` immediately so the browser does not hang.
   - It fires off parallel asynchronous requests to 4 independent APIs (NewsAPI, MediaStack, NewsData, ApiTube).
   - It requests articles matching keywords like `"artificial intelligence" OR "machine learning"`.
   - The APIs return massive arrays of unverified, noisy data.

3. **Data Cleansing**
   - The backend flattens the arrays into one giant list.
   - It maps over them to standardize the schema (handling differences between how NewsAPI formats a title vs how MediaStack does).
   - It removes articles with missing URLs or titles.
   - It strictly filters out known "junk" domains (e.g., `yahoo.com`, `finance.yahoo.com`, `globenewswire.com`) which typically spam press releases rather than journalism.
   - It de-duplicates the list based on the exact URL.

4. **AI Curation (The Brain)**
   - The clean list (often 100+ articles) is sliced into small "chunks" (5 articles per chunk).
   - *Why chunks?* Google Gemini has strict rate limits. Sending 100 articles at once would result in a massive prompt that exceeds token limits or causes the AI to hallucinate.
   - For each chunk, the backend constructs a massive string combining the global AI Prompt (from `Settings`) and the text/URLs of the 5 articles.
   - It calls `gemini-1.5-flash` via `aiService.js`, explicitly instructing the model to reply **only in JSON format**.
   - The AI evaluates each article, writes a summary, checks if it's truly AI-related (ignoring articles about video game AI bots, for example), and grades it out of 10.
   - If a Gemini request fails (e.g. 503 Overloaded), the system logs the error and gracefully skips the chunk, moving to the next one to ensure the overall job completes.

5. **Final Database Storage**
   - Once all chunks are processed, the backend has an array of verified JSON results.
   - It filters out any where `isAiRelated` is false.
   - It sorts the remainder by `importanceScore` (descending).
   - It takes the absolute top 5 best articles from the entire run and inserts them into the MongoDB `Article` collection with a status of `Pending`.
   - The global `isCollecting` variable is flipped to `false`.

6. **Frontend Detection & Auto-Download**
   - The frontend's `setInterval` polling hits `/api/news/status` and notices `isCollecting` is now false.
   - The frontend immediately refetches the `Articles` endpoint.
   - It finds the newly fetched articles matching today's date.
   - It automatically fires a `POST` request to `/api/digests/download` with the top 5 article IDs.
   - The backend wraps them in `.eml` format, marks them `Sent`, and logs a `Digest` record.
   - The frontend forces the browser to download the file to the user's computer, completely automating the curation-to-distribution pipeline.
