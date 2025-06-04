const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

const router = express.Router();


// Get filter options (cached for 10 minutes)
router.get('/filters', cacheMiddleware(600), async (req, res) => {
  try {
    const organizations = await db.all('SELECT DISTINCT funding_organization FROM grants WHERE funding_organization IS NOT NULL ORDER BY funding_organization');
    const countries = await db.all('SELECT DISTINCT country_region FROM grants WHERE country_region IS NOT NULL ORDER BY country_region');
    const focusAreasRaw = await db.all('SELECT DISTINCT focus_areas FROM grants WHERE focus_areas IS NOT NULL');
    
    // Process focus areas that might be comma-separated
    const focusAreas = [...new Set(
      focusAreasRaw.flatMap(f => 
        f.focus_areas?.split(',').map(area => area.trim()) || []
      )
    )].sort();
    
    res.json({
      organizations: organizations.map(o => o.funding_organization),
      countries: countries.map(c => c.country_region),
      focusAreas: focusAreas
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all grants (with optional filters) - cached for 5 minutes
router.get('/', cacheMiddleware(300), async (req, res) => {
  const { 
    query, 
    organization, 
    country, 
    focusArea, 
    minAmount, 
    maxAmount,
    deadline
  } = req.query;

  try {
    let sql = 'SELECT * FROM grants WHERE 1=1';
    const params = [];

    if (query) {
      sql += ' AND (grant_name LIKE ? OR funding_organization LIKE ? OR focus_areas LIKE ? OR eligibility_criteria LIKE ?)';
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (organization) {
      sql += ' AND funding_organization = ?';
      params.push(organization);
    }

    if (country) {
      sql += ' AND country_region = ?';
      params.push(country);
    }

    if (focusArea) {
      sql += ' AND focus_areas LIKE ?';
      params.push(`%${focusArea}%`);
    }

    if (deadline) {
      sql += ' AND application_deadline >= ?';
      params.push(deadline);
    }

    sql += ' ORDER BY application_deadline ASC';

    const grants = await db.all(sql, params);
    
    // Always return database field names - the frontend will handle transformation if needed
    res.json(grants);
  } catch (error) {
    console.error('Get grants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single grant (must be after other specific routes) - cached for 15 minutes
router.get('/:id', cacheMiddleware(900), async (req, res) => {
  try {
    const grant = await db.get('SELECT * FROM grants WHERE id = ?', [req.params.id]);
    if (!grant) {
      return res.status(404).json({ error: 'Grant not found' });
    }
    
    // Transform database field names to match frontend expectations
    const transformedGrant = {
      'Grant Name': grant.grant_name,
      'Funding Organization': grant.funding_organization,
      'Country/Region': grant.country_region,
      'Eligibility Criteria': grant.eligibility_criteria,
      'Focus Areas': grant.focus_areas,
      'Grant Amount': grant.grant_amount,
      'Application Deadline': grant.application_deadline,
      'Duration': grant.duration,
      'Website Link': grant.website_link,
      id: grant.id,
      created_at: grant.created_at,
      updated_at: grant.updated_at
    };
    
    res.json(transformedGrant);
  } catch (error) {
    console.error('Get grant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create grant (admin only)
router.post('/', authMiddleware, [
  body('grant_name').notEmpty().withMessage('Grant name is required'),
  body('funding_organization').notEmpty().withMessage('Funding organization is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    grant_name,
    funding_organization,
    country_region,
    eligibility_criteria,
    focus_areas,
    grant_amount,
    application_deadline,
    duration,
    website_link
  } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO grants (
        grant_name, funding_organization, country_region, 
        eligibility_criteria, focus_areas, grant_amount, 
        application_deadline, duration, website_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        grant_name, funding_organization, country_region,
        eligibility_criteria, focus_areas, grant_amount,
        application_deadline, duration, website_link
      ]
    );

    const newGrant = await db.get('SELECT * FROM grants WHERE id = ?', [result.id]);
    
    // Clear relevant caches
    clearCache('/api/grants');
    
    res.status(201).json(newGrant);
  } catch (error) {
    console.error('Create grant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update grant (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    grant_name,
    funding_organization,
    country_region,
    eligibility_criteria,
    focus_areas,
    grant_amount,
    application_deadline,
    duration,
    website_link
  } = req.body;

  try {
    await db.run(
      `UPDATE grants SET 
        grant_name = ?, funding_organization = ?, country_region = ?,
        eligibility_criteria = ?, focus_areas = ?, grant_amount = ?,
        application_deadline = ?, duration = ?, website_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        grant_name, funding_organization, country_region,
        eligibility_criteria, focus_areas, grant_amount,
        application_deadline, duration, website_link,
        req.params.id
      ]
    );

    const updatedGrant = await db.get('SELECT * FROM grants WHERE id = ?', [req.params.id]);
    
    // Clear relevant caches
    clearCache('/api/grants');
    
    res.json(updatedGrant);
  } catch (error) {
    console.error('Update grant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete grant (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.run('DELETE FROM grants WHERE id = ?', [req.params.id]);
    
    // Clear relevant caches
    clearCache('/api/grants');
    
    res.json({ message: 'Grant deleted successfully' });
  } catch (error) {
    console.error('Delete grant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;