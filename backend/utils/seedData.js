const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Property = require('../models/Property');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Property.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Old data cleared');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ymrealestate.com',
      password: 'admin123',
      phone: '+91-9876543210',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin user created');

    // Sample properties
    const properties = [
      {
        title: "Luxury Villa in Mumbai",
        description: "Beautiful 4BHK villa with modern amenities, garden, and parking. Located in prime area with excellent connectivity.",
        price: 25000000,
        propertyType: "villa",
        status: "sale",
        address: {
          street: "Juhu Beach Road",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400049",
          country: "India"
        },
        features: {
          bedrooms: 4,
          bathrooms: 3,
          area: 3500,
          parking: 2,
          yearBuilt: 2020,
          furnished: true
        },
        amenities: ["Swimming Pool", "Gym", "Garden", "Security", "Power Backup"],
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
        ],
        owner: admin._id,
        isFeatured: true,
        isActive: true
      },
      {
        title: "Modern Apartment in Bangalore",
        description: "Spacious 3BHK apartment with all modern amenities in IT hub area.",
        price: 8500000,
        propertyType: "apartment",
        status: "sale",
        address: {
          street: "Whitefield Main Road",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560066",
          country: "India"
        },
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 1800,
          parking: 1,
          yearBuilt: 2021,
          furnished: false
        },
        amenities: ["Gym", "Security", "Power Backup", "Elevator"],
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
        ],
        owner: admin._id,
        isFeatured: true,
        isActive: true
      },
      {
        title: "Commercial Space in Delhi",
        description: "Prime commercial property suitable for offices, retail, or showroom.",
        price: 15000000,
        propertyType: "commercial",
        status: "rent",
        address: {
          street: "Connaught Place",
          city: "Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India"
        },
        features: {
          area: 2500,
          parking: 3,
          yearBuilt: 2019,
          furnished: true
        },
        amenities: ["Elevator", "Security", "Power Backup", "Central AC"],
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
        ],
        owner: admin._id,
        isFeatured: false,
        isActive: true
      }
    ];

    await Property.insertMany(properties);
    console.log('✅ Sample properties added');

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Login with: admin@ymrealestate.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
