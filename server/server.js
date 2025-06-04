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

// Global grants data
let grantsData = [];

// Load grants data from CSV
const loadGrantsData = () => {
  grantsData = [];
  fs.createReadStream(path.join(__dirname, '../Ukraine_Civil_Society_Grants.csv'))
    .pipe(csv())
    .on('data', (data) => grantsData.push(data))
    .on('end', () => {
      console.log('Grants data loaded successfully');
    });
};

// Load data on startup
loadGrantsData();

// API endpoint to get all grants
app.get('/api/grants', (req, res) => {
  res.json(grantsData);
});

// API endpoint to search grants
app.get('/api/grants/search', (req, res) => {
  const { 
    query, 
    organization, 
    country, 
    focusArea, 
    minAmount, 
    maxAmount,
    deadline,
    language
  } = req.query;

  let filteredGrants = [...grantsData];

  // Search by text query (case-insensitive)
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredGrants = filteredGrants.filter(grant => 
      grant['Grant Name']?.toLowerCase().includes(searchTerm) ||
      grant['Funding Organization']?.toLowerCase().includes(searchTerm) ||
      grant['Eligibility Criteria']?.toLowerCase().includes(searchTerm) ||
      grant['Focus Areas']?.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by organization
  if (organization) {
    filteredGrants = filteredGrants.filter(grant => 
      grant['Funding Organization']?.toLowerCase().includes(organization.toLowerCase())
    );
  }

  // Filter by country
  if (country) {
    filteredGrants = filteredGrants.filter(grant => 
      grant['Country/Region']?.toLowerCase().includes(country.toLowerCase())
    );
  }

  // Filter by focus area
  if (focusArea) {
    filteredGrants = filteredGrants.filter(grant => 
      grant['Focus Areas']?.toLowerCase().includes(focusArea.toLowerCase())
    );
  }

  // Filter by grant amount
  if (minAmount || maxAmount) {
    filteredGrants = filteredGrants.filter(grant => {
      // Extract numbers from the grant amount field
      const amountText = grant['Grant Amount'] || '';
      const amountMatch = amountText.match(/(\d[\d.,]*)/g);
      
      if (!amountMatch) return false;
      
      // Parse the first number found
      const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
      
      if (isNaN(amount)) return false;
      
      if (minAmount && amount < parseFloat(minAmount)) return false;
      if (maxAmount && amount > parseFloat(maxAmount)) return false;
      
      return true;
    });
  }

  // Filter by deadline
  if (deadline) {
    // Assumes deadline is in ISO format (YYYY-MM-DD)
    const deadlineDate = new Date(deadline);
    
    filteredGrants = filteredGrants.filter(grant => {
      if (!grant['Application Deadline']) return false;
      
      // Parse the deadline from the format in CSV
      const grantDeadline = new Date(grant['Application Deadline']);
      
      if (isNaN(grantDeadline.getTime())) return false;
      
      return grantDeadline >= deadlineDate;
    });
  }

  res.json(filteredGrants);
});

// API endpoint to get filter options
app.get('/api/filters', (req, res) => {
  // Extract unique values for dropdown filters
  const filters = {
    organizations: [...new Set(grantsData.map(grant => grant['Funding Organization']).filter(Boolean))],
    countries: [...new Set(grantsData.map(grant => grant['Country/Region']).filter(Boolean))],
    focusAreas: [...new Set(
      grantsData.flatMap(grant => 
        grant['Focus Areas']?.split(',').map(area => area.trim()) || []
      )
    )]
  };

  res.json(filters);
});

// API endpoint to reload grants data from CSV
app.post('/api/reload', (req, res) => {
  loadGrantsData();
  res.json({ success: true, message: 'Grants data reloaded successfully' });
});

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
