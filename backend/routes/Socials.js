const express = require('express');
const router = express.Router();
const Socials = require('../models/Socials');
const jwt = require('jsonwebtoken');

const isAuthorized = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) { res.status(400).json({ error: 'Invalid token' }); }
};

// GET (Always returns the single config object)
router.get('/', async (req, res) => {
  try {
    let socials = await Socials.findOne({ identifier: 'main_socials' });
    if (!socials) {
        // Create default if not exists
        socials = new Socials({ 
            identifier: 'main_socials',
            instagram: [{ label: 'Example', url: 'https://instagram.com' }],
            youtube: [],
            facebook: []
        });
        await socials.save();
    }
    res.json(socials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST/PUT (Update the config)
router.post('/', isAuthorized, async (req, res) => {
  try {
    const { instagram, youtube, facebook } = req.body;
    const updated = await Socials.findOneAndUpdate(
        { identifier: 'main_socials' },
        { instagram, youtube, facebook },
        { new: true, upsert: true } // Create if doesn't exist
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
