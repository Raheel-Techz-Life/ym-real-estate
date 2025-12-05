const express = require('express');
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Allow optional authentication for inquiry submission
const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      User.findById(decoded.id).then(user => {
        req.user = user;
        next();
      });
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};

router.route('/').post(optionalAuth, createInquiry).get(protect, authorize('admin'), getInquiries);

router.route('/:id').put(protect, authorize('admin'), updateInquiryStatus);

module.exports = router;
