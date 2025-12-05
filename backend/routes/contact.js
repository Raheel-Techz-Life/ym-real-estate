const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide name, email and message' 
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again.' 
    });
  }
});

// @route   GET /api/contact/messages
// @desc    Get all contact messages (team/admin only)
// @access  Private
router.get('/messages', protect, authorize('team', 'admin'), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// @route   DELETE /api/contact/messages/:id
// @desc    Delete a contact message (team/admin only)
// @access  Private
router.delete('/messages/:id', protect, authorize('team', 'admin'), async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

module.exports = router;
