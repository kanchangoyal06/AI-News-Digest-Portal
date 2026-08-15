# Developer Guide

This guide explains how to safely modify and extend the AI News Digest Portal.

## Adding a New News API Source
If you want to add a 5th news provider to the aggregation pipeline:
1. Open `backend/src/controllers/newsController.js`.
2. Locate the `collectNews` function.
3. Add a new `try/catch` block that makes an Axios request to your new provider.
4. Format the incoming data to match the standard expected format:
   ```javascript
   const myNewArticles = response.data.articles.map(article => ({
       title: article.title,
       url: article.link,
       source: 'MyNewProvider'
   }));
   ```
5. Push `myNewArticles` into the master `allArticles` array.
6. The existing deduplication and AI chunking logic will automatically handle the rest.

## Modifying the Database Schema
If you want to add a new field (e.g., `author`) to the curated articles:
1. Open `backend/src/models/Article.js`.
2. Add `author: { type: String }` to the schema.
3. Open `backend/src/services/aiService.js`.
4. Modify the `response_schema` object sent to Google Gemini to explicitly instruct the AI to extract and return an `author` field.
5. Update the frontend `Dashboard.jsx` to display `article.author`.

## Extending the EML Export Format
If you want to change how the `.eml` file looks when opened in Outlook:
1. Open `backend/src/services/emailService.js`.
2. Modify the `generateEmailHTML` function. This function returns raw HTML. You can inject custom CSS styles (must be inline or in a `<style>` block; external stylesheets do not work reliably in email clients).
3. If you want to add an attachment to the `.eml`, you must modify `digestController.js` to implement MIME multipart boundaries (this is highly complex and requires understanding RFC 822 standards).

## Adding a New Frontend Page
1. Create `src/pages/MyNewPage.jsx`.
2. Open `src/App.jsx`.
3. Import the page and add a `<Route path="/mynewpage" element={<MyNewPage />} />` inside the `<Route element={<MainLayout />}>` block to ensure it is protected by authentication and wrapped in the sidebar.
4. Add a navigation link to `src/layouts/MainLayout.jsx` using `lucide-react` icons.
