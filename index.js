const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const userQueryRoute = require('./routes/query');

const server = express();
const PORT = process.env.PORT || 5000;

// Security & Hardening: HTTP Security Headers Middleware
server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Configure CORS
server.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Restrict JSON payload size to 64kb to prevent memory exhaustion / DoS attacks
server.use(express.json({ limit: '64kb' }));

// Simple in-memory rate limiter for API endpoints (protects against abuse)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function rateLimiter(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const clientRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > clientRecord.resetTime) {
        clientRecord.count = 1;
        clientRecord.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
        clientRecord.count += 1;
    }

    rateLimitMap.set(ip, clientRecord);

    if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
            error: 'Too many requests. Please wait a moment before submitting another inquiry.'
        });
    }

    // Periodically clean up stale IPs
    if (rateLimitMap.size > 2000) {
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.resetTime) {
                rateLimitMap.delete(key);
            }
        }
    }

    next();
}

// Health check endpoint
server.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'LegalMind AI API',
        hasGroqKey: Boolean(process.env.GROQ_API_KEY)
    });
});

// User query API route with rate limiting
server.use('/user-query', rateLimiter, userQueryRoute);

// Serve React client build for static assets
server.use(express.static(path.resolve(__dirname, 'client', 'build')));

// Fallback to index.html for SPA client-side routing
server.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// Centralized error handler middleware
server.use((err, req, res, next) => {
    console.error('[LegalMind Server Error]:', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).json({
        error: 'An internal server error occurred. Please try again later.'
    });
});

// Start local server when run directly (e.g. `node index.js` or `npm start`)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`[LegalMind] Server running smoothly on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless functions
module.exports = server;
