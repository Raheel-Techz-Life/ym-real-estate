const mongoose = require('mongoose');
require('dotenv').config();

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  propertyType: { type: String, required: true },
  status: { type: String, enum: ['sale', 'rent'], required: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    parking: Number,
    yearBuilt: Number,
    furnished: Boolean
  },
  amenities: [String],
  images: [String],
  owner: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

const sampleProperties = [
  {
    title: "Luxury 3 BHK Apartment in Hubballi",
    description: "Spacious 3 BHK apartment with modern amenities in prime location",
    price: 5500000,
    propertyType: "Apartment",
    status: "sale",
    address: {
      street: "MG Road",
      city: "Hubballi",
      state: "Karnataka",
      zipCode: "580020",
      country: "India"
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1450,
      parking: 2,
      yearBuilt: 2022,
      furnished: true
    },
    amenities: ["Gym", "Swimming Pool", "24/7 Security", "Power Backup", "Lift"],
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"],
    owner: {
      name: "Yunus Mulla",
      phone: "+91 77958 11097",
      email: "info@ymrealestate.com"
    }
  },
  {
    title: "2 BHK Flat for Rent in Dharwad",
    description: "Well-maintained 2 BHK flat available for rent near IT Park",
    price: 15000,
    propertyType: "Apartment",
    status: "rent",
    address: {
      street: "PB Road",
      city: "Dharwad",
      state: "Karnataka",
      zipCode: "580001",
      country: "India"
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      parking: 1,
      yearBuilt: 2020,
      furnished: false
    },
    amenities: ["Security", "Power Backup", "Water Supply"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
    owner: {
      name: "Yunus Mulla",
      phone: "+91 77958 11097",
      email: "info@ymrealestate.com"
    }
  },
  {
    title: "Commercial Space in Central Hubballi",
    description: "Prime commercial property suitable for office or retail",
    price: 8500000,
    propertyType: "Commercial",
    status: "sale",
    address: {
      street: "Station Road",
      city: "Hubballi",
      state: "Karnataka",
      zipCode: "580020",
      country: "India"
    },
    features: {
      area: 2500,
      parking: 5,
      yearBuilt: 2021,
      furnished: false
    },
    amenities: ["Lift", "24/7 Security", "Power Backup", "Parking"],
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c"],
    owner: {
      name: "Yunus Mulla",
      phone: "+91 77958 11097",
      email: "info@ymrealestate.com"
    }
  }
];

async function seedProperties() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing properties
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Insert sample properties
    const inserted = await Property.insertMany(sampleProperties);
    console.log(`✅ Successfully added ${inserted.length} properties`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    process.exit(1);
  }
}

seedProperties();
