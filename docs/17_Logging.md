# Logging & Tracing

Currently, the application relies on standard `console.log` and `console.error` for outputting telemetry to the backend terminal.

## Production Logging Best Practices
For production environments, replacing `console.log` with a structured logger like **Winston** or **Pino** is highly recommended. 

## Key Logging Locations
- **`newsController.js`**: Logs the exact number of articles successfully retrieved from each individual provider. Useful for identifying if a specific API key has expired.
- **`aiService.js`**: Logs the batch chunk numbers as they are sent to Google Gemini, allowing developers to track exactly how far along the curation process is in real-time.
- **`index.js`**: Logs database connection successes and server port bindings.

## Debugging Approach
If articles are not appearing in the Dashboard:
1. Check the Node.js terminal output.
2. Look for `Error processing batch: 503`. This indicates Google Gemini is overloaded.
3. Look for Mongoose validation errors. This indicates the AI returned a JSON schema that did not match the expected Article schema (e.g. returning a string instead of a number for the Importance Score).
