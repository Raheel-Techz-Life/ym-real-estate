const mongoose = require('mongoose');
require('dotenv').config();

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  propertyType: String,
  status: String,
  address: {
    city: String,
    state: String,
    country: String
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    parking: Number
  },
  amenities: [String],
  images: [String],
  owner: {
    name: String,
    phone: String,
    email: String
  }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

const properties = [
  {
    title: "Luxury 3 BHK Apartment",
    description: "Spacious apartment with modern amenities",
    price: 5500000,
    propertyType: "Apartment",
    status: "sale",
    address: { city: "Hubballi", state: "Karnataka", country: "India" },
    features: { bedrooms: 3, bathrooms: 2, area: 1450, parking: 2 },
    amenities: ["Gym", "Pool", "Security"],
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    owner: { name: "Yunus Mulla", phone: "+91 77958 11097", email: "info@ymrealestate.com" }
  },
  {
    title: "2 BHK Flat for Rent",
    description: "Well-maintained flat near IT Park",
    price: 15000,
    propertyType: "Apartment",
    status: "rent",
    address: { city: "Dharwad", state: "Karnataka", country: "India" },
    features: { bedrooms: 2, bathrooms: 2, area: 1100, parking: 1 },
    amenities: ["Security", "Power Backup"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    owner: { name: "Yunus Mulla", phone: "+91 77958 11097", email: "info@ymrealestate.com" }
  },
  {
    title: "Commercial Space",
    description: "Prime commercial property",
    price: 8500000,
    propertyType: "Commercial",
    status: "sale",
    address: { city: "Hubballi", state: "Karnataka", country: "India" },
    features: { area: 2500, parking: 5 },
    amenities: ["Lift", "Security"],
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
    owner: { name: "Yunus Mulla", phone: "+91 77958 11097", email: "info@ymrealestate.com" }
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ym-realestate');
    console.log('✅ Connected');
    await Property.deleteMany({});
    await Property.insertMany(properties);
    console.log('✅ Added 3 properties');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
