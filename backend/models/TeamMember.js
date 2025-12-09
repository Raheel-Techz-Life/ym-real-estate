const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  photo: { type: String, default: 'https://placehold.co/150x150' },
  bio: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema); 
