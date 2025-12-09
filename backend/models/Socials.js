const mongoose = require('mongoose');

const SocialsSchema = new mongoose.Schema({
  identifier: { type: String, default: 'main_socials', unique: true }, // Singleton pattern
  instagram: { type: Array, default: [] },
  youtube: { type: Array, default: [] },
  facebook: { type: Array, default: [] }
});

module.exports = mongoose.model('Socials', SocialsSchema);
