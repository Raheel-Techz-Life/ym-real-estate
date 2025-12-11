const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
