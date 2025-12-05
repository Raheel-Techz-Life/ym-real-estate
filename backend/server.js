const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'ym-real-estate-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ym-realestate')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ============ SCHEMAS ============

// User Schema with role
const userSchema = new mongoose.Schema({
  googleId: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  address: String,
  picture: String,
  role: { type: String, enum: ['user', 'team', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Property Schema
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
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// ============ AUTH MIDDLEWARE ============

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isTeamOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'team' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Team access required' });
    }
    if (user.role === 'team' && !user.isApproved) {
      return res.status(403).json({ success: false, error: 'Account pending approval' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ PASSPORT SETUP ============

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5010/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.picture = profile.photos[0]?.value;
          await user.save();
        } else {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0]?.value,
            role: 'user'
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// ============ ROUTES ============

// Health check
app.get('/', (req, res) => res.json({ message: 'YM Real Estate API' }));

// ============ AUTH ROUTES ============

// Team Registration (MUST come BEFORE general register route)
app.post('/api/register/team', async (req, res) => {
  console.log('📝 Team registration request received');
  console.log('Request body:', req.body);
  
  try {
    const { name, email, password, phone, teamCode } = req.body;
    
    console.log('Team code received:', teamCode);
    console.log('Expected team code:', 'YMTEAM2024');
    
    // Verify team code (case-insensitive comparison)
    if (!teamCode || teamCode.trim().toUpperCase() !== 'YMTEAM2024') {
      console.log('❌ Invalid team code. Received:', teamCode);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid team code. Please contact admin for the correct code.` 
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, 
      email, 
      password: hashedPassword, 
      phone, 
      role: 'team', 
      isApproved: true
    });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
    console.log('✅ Team member registered:', user.email, 'Role:', user.role);
    
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Team registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regular registration (handles both user and team)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role, teamCode } = req.body;

    // If registering as team, verify team code
    if (role === 'team') {
      const VALID_TEAM_CODE = 'YM2024TEAM';
      if (teamCode !== VALID_TEAM_CODE) {
        return res.status(400).json({
          success: false,
          error: 'Invalid team code'
        });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address: address || undefined,
      role: role || 'user'
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    if (user.role === 'team' && !user.isApproved) {
      return res.status(403).json({ success: false, error: 'Account pending approval' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.picture }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google OAuth
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html?error=auth_failed' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      role: req.user.role
    };
    const userEncoded = encodeURIComponent(JSON.stringify({ ...user, token }));
    res.redirect(`http://127.0.0.1:5500/index.html?auth=success&user=${userEncoded}`);
  }
);

// Get current user
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PROPERTY ROUTES ============

// Get all properties (public)
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single property (public)
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add property (Team/Admin only)
app.post('/api/properties', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const propertyData = { ...req.body, addedBy: req.user.id };
    const property = await Property.create(propertyData);
    console.log('✅ Property added:', property.title);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update property (Team/Admin only)
app.put('/api/properties/:id', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete property (Team/Admin only)
app.delete('/api/properties/:id', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    console.log('🗑️ Property deleted:', property.title);
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ MULTER SETUP ============
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');

// Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

// Upload images
app.post('/api/upload', authenticateToken, isTeamOrAdmin, upload.array('images', 10), (req, res) => {
  try {
    const urls = req.files.map(file => `http://localhost:5010/uploads/${file.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ CONTACT ROUTES ============

app.post('/api/contact', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    console.log('📧 New Contact:', req.body.name, req.body.email);
    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages (Team/Admin only)
app.get('/api/messages', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Get all users (Admin only)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve team member (Admin only)
app.put('/api/users/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats (Team/Admin)
app.get('/api/stats', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const forSale = await Property.countDocuments({ status: 'sale' });
    const forRent = await Property.countDocuments({ status: 'rent' });
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ read: false });
    
    res.json({
      success: true,
      stats: { totalProperties, forSale, forRent, totalMessages, unreadMessages }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
