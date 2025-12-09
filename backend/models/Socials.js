const mongoose = require('mongoose');

const SocialsSchema = new mongoose.Schema({
  identifier: { type: String, default: 'main_socials', unique: true },
  instagram: { type: Array, default: [] },
  youtube: { type: Array, default: [] },
  facebook: { type: Array, default: [] }
});

module.exports = mongoose.model('Socials', SocialsSchema);
