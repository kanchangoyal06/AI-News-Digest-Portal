# Project Setup & Requirements

To successfully run, build, and deploy the AI News Digest Portal, your development environment must meet the following hardware and software requirements.

## 1. System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended).
- **Memory**: Minimum 4GB RAM (8GB recommended for running both frontend and backend concurrently).

## 2. Core Dependencies
- **Node.js**: Version 16.x or higher (Version 18.x LTS highly recommended).
- **Package Manager**: npm (v8.x or higher) is the default package manager. Yarn can be used as a drop-in replacement.
- **Database**: MongoDB server.
  - *Option A*: Local MongoDB Community Server (v5.0+).
  - *Option B*: MongoDB Atlas (Cloud Database). This project is pre-configured to easily accept Atlas SRV connection strings.
- **Cache / Queue**: Redis Server. (Required for internal job queueing and rate limit tracking).
  - *Option A*: Local Redis instance.
  - *Option B*: Redis Enterprise Cloud / Upstash.

## 3. Browser Support
The React frontend leverages modern CSS and ES6 JavaScript. Ensure your browser is up to date:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Apple Safari (v14+)

## 4. IDE Recommendations
For the best developer experience, we recommend:
- **Visual Studio Code**
- Plugins:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code

## 5. Account Requirements
Before installing, you must register for the following third-party APIs to obtain keys (Detailed fully in `05_API_Keys.md`):
1. **Google AI Studio**: For Gemini API.
2. **NewsAPI.org**: For mainstream news.
3. **MediaStack**: For global news.
4. **NewsData.io**: For structured news data.
5. **ApiTube**: For supplementary technology news.
