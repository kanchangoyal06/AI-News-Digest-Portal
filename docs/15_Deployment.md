# Deployment Guide

To move this application from a local development environment to a production server (like AWS, DigitalOcean, or Heroku), follow these steps.

## 1. Frontend Build (React)
The frontend must be compiled from raw JSX into static HTML/CSS/JS.

```bash
cd frontend
npm run build
```
This command generates a `dist/` folder. This folder contains entirely static assets. You can host this folder cheaply or freely on services like:
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**
- **Nginx** (If hosting on your own VPS).

*Important*: Before building for production, ensure you update `axios.js` or your Vite `.env.production` file so that the API base URL points to your actual backend domain (e.g., `https://api.yourdomain.com/api`) instead of `http://localhost:5000/api`.

## 2. Backend Deployment (Node.js)
The backend requires a persistent Node environment.

### Using PM2 (On a VPS like DigitalOcean or AWS EC2)
Never use `npm run dev` (nodemon) in production. It wastes memory.
1. SSH into your server.
2. Clone the repository and run `npm install` inside the `backend` folder.
3. Install PM2 globally: `npm install -g pm2`
4. Start the server: `pm2 start src/index.js --name "ai-news-api"`
5. Save the process list so it survives server reboots: `pm2 save` and `pm2 startup`.

### Reverse Proxy (Nginx)
To expose your Node app on port 80/443, configure Nginx to reverse proxy traffic from `https://api.yourdomain.com` to `http://localhost:5000`. 
Always secure your production API with an SSL certificate using Let's Encrypt (`certbot`).

## 3. Database (MongoDB Atlas)
Do not host your own MongoDB instance unless you have a dedicated DevOps team.
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Allow IP access from your backend production server's IP address (or `0.0.0.0/0` if on a dynamic host like Heroku, though less secure).
3. Copy the SRV Connection String and set it as the `MONGO_URI` in your production server's environment variables.
