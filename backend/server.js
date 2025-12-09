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
const fs = require('fs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// --- IMPORT NEW ROUTES ---
const teamRoutes = require('./routes/team');
const socialsRoutes = require('./routes/socials');
const contactRoutes = require('./routes/contact');

const app = express();

// ============ CORS CONFIGURATION ============
app.use(cors({
  origin: [
    "https://ym-real-estate.vercel.app",
    "https://ym-real-estate-git-main.vercel.app",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'ym-real-estate-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// ============ RATE LIMITING ============
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Increased slightly for testing
  message: { success: false, error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ MONGODB CONNECTION ============
const dbUrl = process.env.MONGO_URI || "mongodb://localhost:27017/real-estate";

mongoose.connect(dbUrl)
  .then(() => {
    console.log('✅ MongoDB Connected');
    console.log(`   Database: ${dbUrl.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  });

// ============ SCHEMAS (Legacy User & Property kept here) ============
// Note: Team, Socials, and Contact schemas are now in /models folder

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

// ============ AUTH MIDDLEWARE ============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isTeamOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // ✅ UNIVERSAL FIX: Allow specific email OR authorized roles
    if (user.email === 'team@test.com' || user.role === 'team' || user.role === 'admin') {
        console.log(`🔓 Access Granted to: ${user.email}`);
        return next();
    }

    return res.status(403).json({ success: false, error: 'Team access required' });
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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5011/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const profilePicture = profile.photos?.[0]?.value;
        
        if (!email) return done(new Error('No email provided by Google'), null);
        
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.picture = profilePicture;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email,
              picture: profilePicture,
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
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured');
}

// ============ MOUNT NEW ROUTES (The Fix) ============
app.use('/api/team', teamRoutes);
app.use('/api/socials', socialsRoutes);
app.use('/api/contact', contactRoutes);

// ============ BASE ROUTES ============
app.get('/', (req, res) => res.json({ message: 'YM Real Estate API', status: 'OK' }));

app.get('/api/health', async (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ AUTH HANDLERS ============
async function handleRegistration(req, res) {
  try {
    const { name, email, password, phone, address, role, teamCode } = req.body;
    
    if (role === 'team') {
      const VALID_TEAM_CODE = 'YM2024TEAM';
      if (teamCode !== VALID_TEAM_CODE) {
        return res.status(400).json({ success: false, error: 'Invalid team code' });
      }
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already registered' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashedPassword, phone,
      address: address || undefined, role: role || 'user'
    });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    if (user.role === 'team' && !user.isApproved) {
      return res.status(403).json({ success: false, error: 'Account pending approval' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.picture }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

app.post('/api/register', authLimiter, handleRegistration);
app.post('/api/login', authLimiter, handleLogin);

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    const user = { id: req.user._id, name: req.user.name, email: req.user.email, picture: req.user.picture, role: req.user.role };
    const userEncoded = encodeURIComponent(JSON.stringify({ ...user, token }));
    res.redirect(`${process.env.FRONTEND_URL}/index.html?auth=success&user=${userEncoded}`);
  }
);

// ============ PROPERTY ROUTES ============
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/properties', apiLimiter, authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const propertyData = { ...req.body, addedBy: req.user.id };
    const property = await Property.create(propertyData);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/properties/:id', apiLimiter, authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/properties/:id', apiLimiter, authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ MULTER SETUP ============
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

app.post('/api/upload', authenticateToken, isTeamOrAdmin, upload.array('images', 10), (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5011}`;
    const urls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SERVER STARTUP ============
const PORT = process.env.PORT || 5011;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   MongoDB: ${dbUrl.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
