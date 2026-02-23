const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const proofRoutes = require('./routes/proofRoutes');
const auditRoutes = require('./routes/auditRoutes');
const aggregateRoutes = require('./routes/aggregateRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Connect to Redis
connectRedis();

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));
// Apply rate limiting ONLY to API routes (not static files)

// Body Parser Middleware
app.use(express.json());

// Routes (rate limiter applied to API only)
app.use('/api', generalLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/proof', proofRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/aggregate', aggregateRoutes);

const path = require('path');

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, './')));

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Centralized Error Handling (MUST be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
