const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. INTERNAL MIDDLEWARE (The Fix)
// ==========================================
// We define this here to ensure 'auth' is definitely a function
const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// ==========================================
// 2. ROUTES
// ==========================================

// @route   GET /api/team
// @desc    Get all team members (Public)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/team
// @desc    Add a new team member (Private)
// Note: 'auth' is now definitely a function
router.post('/', auth, async (req, res) => {
  try {
    const newMember = new TeamMember({
      name: req.body.name,
      role: req.body.role,
      photo: req.body.photo,
      bio: req.body.bio,
      email: req.body.email,
      phone: req.body.phone,
      linkedin: req.body.linkedin
    });

    const member = await newMember.save();
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/team/:id
// @desc    Update a team member (Private)
router.put('/:id', auth, async (req, res) => {
  try {
    let member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ msg: 'Member not found' });

    // Update fields
    const { name, role, photo, bio, email, phone, linkedin } = req.body;
    
    if(name) member.name = name;
    if(role) member.role = role;
    if(photo) member.photo = photo;
    if(bio) member.bio = bio;
    if(email) member.email = email;
    if(phone) member.phone = phone;
    if(linkedin) member.linkedin = linkedin;

    await member.save();
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/team/:id
// @desc    Delete a team member (Private)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ msg: 'Member not found' });

    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
