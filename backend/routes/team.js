const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const jwt = require('jsonwebtoken');

// Auth Middleware
const isAuthorized = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) { res.status(400).json({ error: 'Invalid token' }); }
};

// GET All
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find();
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST New
router.post('/', isAuthorized, async (req, res) => {
  try {
    const newMember = new TeamMember(req.body);
    const saved = await newMember.save();
    res.json(saved);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT Update
router.put('/:id', isAuthorized, async (req, res) => {
  try {
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
