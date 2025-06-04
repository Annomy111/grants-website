const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const grantsRoutes = require('./routes/grants');
const blogRoutes = require('./routes/blog');
const usersRoutes = require('./routes/users');
const blogGenerationRoutes = require('./routes/blogGeneration');
const chatRoutes = require('./routes/chat-gemini');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting - more permissive for admin functionality
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  message: { error: 'Too many requests, please try again later.' }
});

// Less restrictive rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for admin operations
  message: { error: 'Too many admin requests, please try again later.' }
});

app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grants', grantsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/blog-generation', blogGenerationRoutes);
app.use('/api/chat', chatRoutes);

// Note: Grants API endpoints are now handled by /routes/grants.js using SQLite database
// This section removed to avoid conflicts with database-based routes

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
