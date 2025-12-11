const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const jwt = require('jsonwebtoken');

// Middleware to check for Admin/Team token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/team
// @desc    Get all team members (Public)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/team
// @desc    Add a new team member (Private)
router.post('/', auth, async (req, res) => {
  try {
    const newMember = new TeamMember(req.body);
    const savedMember = await newMember.save();
    res.json(savedMember);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// @route   PUT /api/team/:id
// @desc    Update a team member (Private)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedMember);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// @route   DELETE /api/team/:id
// @desc    Delete a team member (Private)
router.delete('/:id', auth, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Member removed' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
