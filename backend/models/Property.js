const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  propertyType: {
    type: String,
    required: [true, 'Please add property type'],
    enum: ['house', 'apartment', 'villa', 'land', 'commercial', 'penthouse', 'studio', 'other']
  },
  status: {
    type: String,
    enum: ['sale', 'rent', 'sold', 'rented'],
    default: 'sale'
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  features: {
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    area: { type: Number, min: 0 }, // in sq ft
    parking: { type: Number, default: 0 },
    yearBuilt: Number,
    furnished: { type: Boolean, default: false }
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Prevent duplicate model compilation
module.exports = mongoose.models.Property || mongoose.model('Property', propertySchema);
