# Troubleshooting Guide

## 1. MongoDB Connection Refused (`MongoNetworkError`)
**Symptom**: Server crashes immediately on startup.
**Cause**: The `MONGO_URI` in `.env` is missing, invalid, or your IP address is not whitelisted in MongoDB Atlas.
**Fix**: Verify your `.env` file. If using Atlas, log into the Atlas dashboard, navigate to "Network Access", and add your current IP address (or `0.0.0.0/0` for universal access).

## 2. "Error processing batch: 503" or "429 Too Many Requests"
**Symptom**: The backend terminal logs these errors during News Collection, and very few articles are saved to the dashboard.
**Cause**: Google's Gemini API is actively rate-limiting your account.
**Fix**: Wait a few minutes before clicking "Fetch Latest News" again. If this is a persistent issue in production, you must upgrade your Google AI Studio account to a paid tier to increase your Requests-Per-Minute quota.

## 3. Empty Dashboard After "Fetch Latest News" Completes
**Symptom**: The UI spinning wheel stops, but no new articles appear for today.
**Cause**: The AI rejected all fetched articles because none of them met the relevance criteria outlined in the Global Prompt (Settings).
**Fix**: Navigate to Settings and ensure the AI Prompt is not overly restrictive.

## 4. Automatic Download Fails / Browser Security Warning
**Symptom**: The browser flashes a warning saying "This file may be dangerous" when downloading the `.eml` file, or blocks the download entirely.
**Cause**: Browsers inherently distrust `.eml` files generated automatically via `blob:` URLs without direct user clicks.
**Fix**: Instruct users to click "Keep" on the warning, as the file is locally and safely generated. Alternatively, users can manually click the "Redownload Digest" button.

## 5. Cannot Login (401 Unauthorized)
**Symptom**: Login fails despite entering correct credentials.
**Cause**: `JWT_SECRET` may have been changed in the `.env` file, invalidating all previously issued tokens, or the user's account does not exist in the current database instance.
**Fix**: Register a new account.
