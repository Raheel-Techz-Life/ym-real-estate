const express = require('express');
const router = express.Router();
const Socials = require('../models/Socials');
const jwt = require('jsonwebtoken');

// Middleware
const isAuthorized = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) { res.status(400).json({ error: 'Invalid token' }); }
};

// GET Socials
router.get('/', async (req, res) => {
  try {
    let socials = await Socials.findOne({ identifier: 'main_socials' });
    if (!socials) {
        socials = new Socials({ instagram: [], youtube: [], facebook: [] });
        await socials.save();
    }
    res.json(socials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Socials
router.post('/', isAuthorized, async (req, res) => {
  try {
    const { instagram, youtube, facebook } = req.body;
    const updated = await Socials.findOneAndUpdate(
        { identifier: 'main_socials' },
        { instagram, youtube, facebook },
        { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
