require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initSettings = require('./utils/initSettings');

const app = express();

// CORS
app.use(cors({
    origin: [
        'https://ai-news-digest-portal.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ]
}));

// Parse JSON
app.use(express.json());

// Connect to Database
connectDB().then(async () => {
    await initSettings();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/digests', require('./routes/digestRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});