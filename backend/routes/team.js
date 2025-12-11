const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth'); // Middleware to check JWT Token

// @route   GET /api/team
// @desc    Get all team members
// @access  Public
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
// @desc    Add a new team member
// @access  Private (Admin/Team only)
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
// @desc    Update a team member
// @access  Private
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
// @desc    Delete a team member
// @access  Private
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
