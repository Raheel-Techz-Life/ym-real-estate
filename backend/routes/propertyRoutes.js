const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET all properties
router.get('/', getProperties);

// GET featured properties - MUST be before /:id
router.get('/featured', getFeaturedProperties);

// GET single property by ID
router.get('/:id', getProperty);

// POST create property
router.post('/', protect, createProperty);

// PUT update property
router.put('/:id', protect, updateProperty);

// DELETE property
router.delete('/:id', protect, deleteProperty);

module.exports = router;
