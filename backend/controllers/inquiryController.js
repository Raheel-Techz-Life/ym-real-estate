const Inquiry = require('../models/Inquiry');

// @desc    Submit property inquiry
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
  try {
    const { property, name, email, phone, message } = req.body;

    const inquiryData = {
      property,
      name,
      email,
      phone,
      message,
    };

    // Add user only if authenticated
    if (req.user) {
      inquiryData.user = req.user.id;
    }

    const inquiry = await Inquiry.create(inquiryData);

    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('property', 'title price')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully!',
      data: populatedInquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('property', 'title price')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
