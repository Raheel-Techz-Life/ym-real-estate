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
  origin: [
    'http://localhost:5500', 
    'http://127.0.0.1:5500', 
    'http://localhost:3000',
    'http://localhost:5011',
    'https://your-site.vercel.app', // ADD YOUR VERCEL URL
    'https://*.vercel.app', // Allow all Vercel preview deployments
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// MongoDB Connection - Fix for production
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ym-realestate')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));
  useNewUrlParser: true,
// ============ SCHEMAS ============
  serverSelectionTimeoutMS: 10000,
// User Schema with role,
const userSchema = new mongoose.Schema({
  googleId: String,le.log('✅ MongoDB Connected'))
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,n production, allow server to start
  phone: String,env.NODE_ENV !== 'production') {
  address: String,(1);
  picture: String,
  role: { type: String, enum: ['user', 'team', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });===========

const User = mongoose.model('User', userSchema);
const userSchema = new mongoose.Schema({
// Property Schema,
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },nique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  propertyType: { type: String, required: true },
  status: { type: String, enum: ['sale', 'rent'], required: true },
  address: {pe: String, enum: ['user', 'team', 'admin'], default: 'user' },
    street: String,e: Boolean, default: true }
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,e.model('User', userSchema);
    country: { type: String, default: 'India' }
  },roperty Schema
  features: {ySchema = new mongoose.Schema({
    bedrooms: Number,ng, required: true },
    bathrooms: Number, String, required: true },
    area: Number,Number, required: true },
    parking: Number,pe: String, required: true },
    yearBuilt: Number,ng, enum: ['sale', 'rent'], required: true },
    furnished: Boolean
  },street: String,
  amenities: [String],ng, required: true },
  images: [String],String, required: true },
  owner: {e: String,
    name: { type: String, required: true },a' }
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },bedrooms: Number,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
    yearBuilt: Number,
const Property = mongoose.model('Property', propertySchema);
  },
// Contact Schemaing],
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },,
  phone: String,e: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });se.Schema.Types.ObjectId, ref: 'User' },
  featured: { type: Boolean, default: false }
const Contact = mongoose.model('Contact', contactSchema);

// ============ AUTH MIDDLEWARE ============propertySchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  email: { type: String, required: true },
  if (!token) {,
    return res.status(401).json({ success: false, error: 'Access denied' });
  }ead: { type: Boolean, default: false }
   { timestamps: true });
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user;
    next();==== AUTH MIDDLEWARE ============
  });
};nst authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
const isTeamOrAdmin = async (req, res, next) => {')[1];
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'team' && user.role !== 'admin')) {nied' });
      return res.status(403).json({ success: false, error: 'Team access required' });
    }
    if (user.role === 'team' && !user.isApproved) {-secret-key', (err, user) => {
      return res.status(403).json({ success: false, error: 'Account pending approval' });
    }eq.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};nst isTeamOrAdmin = async (req, res, next) => {
  try {
const isAdmin = async (req, res, next) => {er.id);
  try {(!user || (user.role !== 'team' && user.role !== 'admin')) {
    const user = await User.findById(req.user.id);, error: 'Team access required' });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    } return res.status(403).json({ success: false, error: 'Account pending approval' });
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } res.status(500).json({ success: false, error: error.message });
};}
};
// ============ PASSPORT SETUP ============
const isAdmin = async (req, res, next) => {
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {id);
  try {(!user || user.role !== 'admin') {
    const user = await User.findById(id);ss: false, error: 'Admin access required' });
    done(null, user);
  } catch (err) {
    done(err, null);
  } res.status(500).json({ success: false, error: error.message });
});
};
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5010/api/auth/google/callback'
  },port.deserializeUser(async (id, done) => {
  async (accessToken, refreshToken, profile, done) => {
    try { user = await User.findById(id);
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.picture = profile.photos[0]?.value;
          await user.save();egy({
        } else {ocess.env.GOOGLE_CLIENT_ID,
          user = await User.create({_CLIENT_SECRET,
            googleId: profile.id,LE_CALLBACK_URL || 'http://localhost:5010/api/auth/google/callback'
            name: profile.displayName,
            email: profile.emails[0].value,, done) => {
            picture: profile.photos[0]?.value,
            role: 'user'ser.findOne({ googleId: profile.id });
          });er) {
        }ser = await User.findOne({ email: profile.emails[0].value });
      } if (user) {
      return done(null, user);ile.id;
    } catch (err) {ure = profile.photos[0]?.value;
      return done(err, null);
    }   } else {
  }       user = await User.create({
));         googleId: profile.id,
            name: profile.displayName,
// ============ ROUTES ============].value,
            picture: profile.photos[0]?.value,
// Health checke: 'user'
app.get('/', (req, res) => res.json({ message: 'YM Real Estate API' }));
        }
// ============ AUTH ROUTES ============
      return done(null, user);
// Team Registration (MUST come BEFORE general register route)
app.post('/api/register/team', async (req, res) => {
  console.log('📝 Team registration request received');
  console.log('Request body:', req.body);
  ;
  try {
    const { name, email, password, phone, teamCode } = req.body;
    
    console.log('Team code received:', teamCode);
    console.log('Expected team code:', 'YMTEAM2024');al Estate API' }));
    
    // Verify team code (case-insensitive comparison)
    if (!teamCode || teamCode.trim().toUpperCase() !== 'YMTEAM2024') {
      console.log('❌ Invalid team code. Received:', teamCode);
      return res.status(400).json({  (req, res) => {
        success: false, egistration request received');
        error: `Invalid team code. Please contact admin for the correct code.` 
      });
    } {
    const { name, email, password, phone, teamCode } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {ode received:', teamCode);
      console.log('❌ Email already exists:', email);;
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }/ Verify team code (case-insensitive comparison)
    if (!teamCode || teamCode.trim().toUpperCase() !== 'YMTEAM2024') {
    if (!password || password.length < 8) {eived:', teamCode);
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }   success: false, 
        error: `Invalid team code. Please contact admin for the correct code.` 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, 
      email, stingUser = await User.findOne({ email });
      password: hashedPassword, 
      phone, .log('❌ Email already exists:', email);
      role: 'team', tus(400).json({ success: false, error: 'Email already registered' });
      isApproved: true
    });
    if (!password || password.length < 8) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    }
    console.log('✅ Team member registered:', user.email, 'Role:', user.role);
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ = await User.create({
      success: true,
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });hone, 
  } catch (error) { 
    console.error('❌ Team registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  } 
}); const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
// Regular registration (handles both user and team)ail, 'Role:', user.role);
app.post('/api/register', async (req, res) => {
  try {.json({
    const { name, email, password, phone, address, role, teamCode } = req.body;
      token,
    // If registering as team, verify team codeail: user.email, role: user.role }
    if (role === 'team') {
      const VALID_TEAM_CODE = 'YM2024TEAM';
      if (teamCode !== VALID_TEAM_CODE) {ror:', error);
        return res.status(400).json({alse, error: error.message });
          success: false,
          error: 'Invalid team code'
        });
      }lar registration (handles both user and team)
    }ost('/api/register', async (req, res) => {
  try {
    // Check if user existsssword, phone, address, role, teamCode } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {s team, verify team code
      return res.status(400).json({
        success: false,CODE = 'YM2024TEAM';
        error: 'Email already registered'
      });eturn res.status(400).json({
    }     success: false,
          error: 'Invalid team code'
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    }
    // Create user
    const user = await User.create({
      name,xistingUser = await User.findOne({ email });
      email,tingUser) {
      password: hashedPassword, // Use hashed password
      phone,ess: false,
      address: address || undefined,ered'
      role: role || 'user'
    });

    // Generate tokenbefore saving
    const token = jwt.sign(await bcrypt.hash(password, 10);
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }r.create({
    );name,
      email,
    res.status(201).json({word, // Use hashed password
      success: true,
      token,s: address || undefined,
      user: {ole || 'user'
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleign(
      } id: user._id, role: user.role },
    });rocess.env.JWT_SECRET || 'your_jwt_secret',
  } catch (error) {'30d' }
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,son({
      error: error.message || 'Registration failed'
    });oken,
  }   user: {
});     id: user._id,
        name: user.name,
// Loginemail: user.email,
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    catch (error) {
    const user = await User.findOne({ email });;
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    } error: error.message || 'Registration failed'
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }gin
    post('/api/login', async (req, res) => {
    if (user.role === 'team' && !user.isApproved) {
      return res.status(403).json({ success: false, error: 'Account pending approval' });
    }
    const user = await User.findOne({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    res.json({
      success: true,
      token,Match = await bcrypt.compare(password, user.password);
      user: { id: user._id, name: user.name, email: user.email, role: user.role, picture: user.picture }
    });eturn res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } if (user.role === 'team' && !user.isApproved) {
});   return res.status(403).json({ success: false, error: 'Account pending approval' });
    }
// Google OAuth
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));piresIn: '30d' });
    
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    const user = {
      id: req.user._id,
      name: req.user.name, success: false, error: error.message });
      email: req.user.email,
      picture: req.user.picture,
      role: req.user.role
    };gle OAuth
    const userEncoded = encodeURIComponent(JSON.stringify({ ...user, token }));, 'email'] }));
    res.redirect(`${process.env.FRONTEND_URL}/index.html?auth=success&user=${userEncoded}`);
  }.get('/api/auth/google/callback',
);passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=auth_failed` }),
  (req, res) => {
// Get current userwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
app.get('/api/me', authenticateToken, async (req, res) => {
  try {d: req.user._id,
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {user.picture,
    res.status(500).json({ success: false, error: error.message });
  } };
}); const userEncoded = encodeURIComponent(JSON.stringify({ ...user, token }));
    res.redirect(`${process.env.FRONTEND_URL}/index.html?auth=success&user=${userEncoded}`);
// ============ PROPERTY ROUTES ============
);
// Get all properties (public)
app.get('/api/properties', async (req, res) => {
  try {('/api/me', authenticateToken, async (req, res) => {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: properties });select('-password');
  } catch (error) {ess: true, user });
    res.status(500).json({ success: false, error: error.message });
  } res.status(500).json({ success: false, error: error.message });
});
});
// Get single property (public)
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {ties', async (req, res) => {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }onst properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: property }););
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add property (Team/Admin only)
app.post('/api/properties', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const propertyData = { ...req.body, addedBy: req.user.id };
    const property = await Property.create(propertyData);
    console.log('✅ Property added:', property.title);rror: 'Property not found' });
    res.status(201).json({ success: true, data: property });
  } catch (error) {ess: true, data: property });
    res.status(500).json({ success: false, error: error.message });
  } res.status(500).json({ success: false, error: error.message });
});
});
// Update property (Team/Admin only)
app.put('/api/properties/:id', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {t('/api/properties', authenticateToken, isTeamOrAdmin, async (req, res) => {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) {ta = { ...req.body, addedBy: req.user.id };
      return res.status(404).json({ success: false, error: 'Property not found' });
    }onsole.log('✅ Property added:', property.title);
    res.json({ success: true, data: property });property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete property (Team/Admin only)
app.delete('/api/properties/:id', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);req.body, { new: true });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    console.log('🗑️ Property deleted:', property.title);
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {.json({ success: false, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});
// Delete property (Team/Admin only)
// ============ MULTER SETUP ============icateToken, isTeamOrAdmin, async (req, res) => {
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');ete(req.params.id);
    if (!property) {
// Create uploads folder if not existsccess: false, error: 'Property not found' });
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });ty.title);
}   res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
const storage = multer.diskStorage({false, error: error.message });
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {=========
    cb(null, Date.now() + '-' + file.originalname);
  }st uploadDir = path.join(__dirname, 'uploads');
});
// Create uploads folder if not exists
const upload = multer({ dDir)) {
  storage,Sync(uploadDir, { recursive: true });
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);file, cb) => {
    } else { uploadDir);
      cb(new Error('Only images allowed'), false);
    }ename: (req, file, cb) => {
  } cb(null, Date.now() + '-' + file.originalname);
});
});
// Upload images
app.post('/api/upload', authenticateToken, isTeamOrAdmin, upload.array('images', 10), (req, res) => {
  try {ge,
    const urls = req.files.map(file => `http://localhost:5010/uploads/${file.filename}`);
    res.json({ success: true, urls });
  } catch (error) {pe.startsWith('image/')) {
    res.status(500).json({ success: false, error: error.message });
  } } else {
});   cb(new Error('Only images allowed'), false);
    }
// ============ CONTACT ROUTES ============
});
app.post('/api/contact', async (req, res) => {
  try {ad images
    const contact = await Contact.create(req.body);Admin, upload.array('images', 10), (req, res) => {
    console.log('📧 New Contact:', req.body.name, req.body.email);
    res.json({ success: true, message: 'Message received' });/uploads/${file.filename}`);
  } catch (error) {ess: true, urls });
    res.status(500).json({ success: false, error: error.message });
  } res.status(500).json({ success: false, error: error.message });
});
});
// Get messages (Team/Admin only)
app.get('/api/messages', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) { await Contact.create(req.body);
    res.status(500).json({ success: false, error: error.message });
  } res.json({ success: true, message: 'Message received' });
}); catch (error) {
    res.status(500).json({ success: false, error: error.message });
// ============ ADMIN ROUTES ============
});
// Get all users (Admin only)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {('/api/messages', authenticateToken, isTeamOrAdmin, async (req, res) => {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });t({ createdAt: -1 });
  } catch (error) {ess: true, data: messages });
    res.status(500).json({ success: false, error: error.message });
  } res.status(500).json({ success: false, error: error.message });
});
});
// Approve team member (Admin only)
app.put('/api/users/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, user });n, isAdmin, async (req, res) => {
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } res.json({ success: true, data: users });
}); catch (error) {
    res.status(500).json({ success: false, error: error.message });
// Stats (Team/Admin)
app.get('/api/stats', authenticateToken, isTeamOrAdmin, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const forSale = await Property.countDocuments({ status: 'sale' });eq, res) => {
    const forRent = await Property.countDocuments({ status: 'rent' });
    const totalMessages = await Contact.countDocuments();id, { isApproved: true }, { new: true });
    const unreadMessages = await Contact.countDocuments({ read: false });
    catch (error) {
    res.json({(500).json({ success: false, error: error.message });
      success: true,
      stats: { totalProperties, forSale, forRent, totalMessages, unreadMessages }
    });
  } catch (error) {n)
    res.status(500).json({ success: false, error: error.message }); res) => {
  }ry {
}); const totalProperties = await Property.countDocuments();
    const forSale = await Property.countDocuments({ status: 'sale' });
const PORT = process.env.PORT || 5010;ntDocuments({ status: 'rent' });
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
    const unreadMessages = await Contact.countDocuments({ read: false });
    
    res.json({
      success: true,
      stats: { totalProperties, forSale, forRent, totalMessages, unreadMessages }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5011;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${mongoURI.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
