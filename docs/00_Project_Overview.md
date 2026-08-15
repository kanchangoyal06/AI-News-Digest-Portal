# Project Overview

## Purpose of the Software
The **AI News Digest Portal** is an automated news aggregation and curation platform designed to solve the problem of information overload in the technology sector. It constantly monitors multiple global news APIs, identifies the most relevant articles related to Artificial Intelligence, and utilizes Large Language Models (Google Gemini) to read, summarize, and score the articles for importance. The final output is an easily digestible, highly relevant top-5 daily news summary formatted as an Outlook-compatible `.eml` draft.

## Problem it Solves
Professionals in fast-moving industries (like AI) struggle to keep up with hundreds of daily news articles. Identifying what is actually important versus what is noise takes significant manual effort. This software automates the aggregation, filtering, reading, summarizing, and distribution of industry news, completely removing the manual curation bottleneck.

## Target Users
- **Technology Executives / CTOs** needing high-level summaries of the day's most important AI news.
- **Researchers and Developers** tracking industry trends without wanting to browse multiple news sites.
- **Content Creators / Newsletter Writers** looking for a daily pre-curated list of top stories to publish.

## Major Features
1. **Multi-Source Aggregation**: Pulls news from 4 independent providers (NewsAPI, MediaStack, NewsData.io, ApiTube) to ensure global coverage.
2. **AI-Powered Curation**: Uses Google Gemini to act as a human editor—reading each article, verifying its relevance, writing a concise 3-sentence summary, and assigning an Importance Score (1-10).
3. **Automated De-duplication**: Filters out duplicate stories covering the exact same event across different news outlets.
4. **Smart Dashboard**: A modern React-based interface that groups curated news by date.
5. **One-Click Digest Export**: Instantly exports the day's top 5 articles into a ready-to-send `.eml` email draft.
6. **Dynamic Prompts**: Administrators can modify the AI's core instructions via the UI to change the curation focus on the fly.

## Technology Stack
- **Frontend**: React.js, Vite, TailwindCSS, Zustand (State Management), React Query, Lucide-React.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **External AI**: Google Generative AI (Gemini 1.5 Flash).
- **Authentication**: JWT (JSON Web Tokens).

## High-Level Architecture
The system follows a classic decoupled client-server architecture:
- A **React Single Page Application (SPA)** handles all user interactions and polling.
- A **Node.js REST API** serves as the central brain. It receives requests from the SPA, delegates heavy background tasks (like contacting external APIs), handles MongoDB transactions, and generates files dynamically.
- **External Services** act as data feeders (News APIs) and cognitive processors (Gemini).

## Design Decisions
- **Background Processing over Synchronous Loading**: News collection takes minutes due to AI rate limits. The system was designed to acknowledge the request immediately (HTTP 202) and process in the background, while the frontend polls for completion.
- **.EML over Direct SMTP**: Initially designed to send emails automatically, the system was refactored to generate `.eml` files with `X-Unsent: 1` headers. This prevents the server from acting as an open mail relay and allows users to manually review and send the drafts in their native email clients (Outlook/Apple Mail).
- **Zustand over Redux**: Chosen for its lightweight, boilerplate-free state management for authentication.
