# Y M REAL ESTATE - Real Estate Website

A modern, full-featured real estate website built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## 🏠 Features

### Frontend Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Property Listings** - Browse and search through available properties
- **Advanced Filters** - Filter by city, price, status (sale/rent), and search keywords
- **Property Details** - Detailed view with image gallery, amenities, and owner information
- **User Authentication** - Login/Signup with email or Google OAuth
- **Team Management** - Dedicated team page with editable member profiles
- **Instagram Integration** - Showcase Instagram reels with video uploads
- **Contact Form** - Get in touch with the team with form submissions
- **Smooth Animations** - Scroll-reveal animations and interactive hover effects

### Backend Features
- **RESTful API** - Built with Express.js
- **MongoDB Database** - Persistent data storage
- **JWT Authentication** - Secure user sessions
- **Google OAuth 2.0** - Social login integration
- **Role-based Access** - User, Team, and Admin roles
- **Property Management** - CRUD operations for properties
- **Image Uploads** - Support for multiple property images
- **Contact Messages** - Store and manage contact form submissions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd "c:\Users\ADMIN\OneDrive\Desktop\Y.M. Real Estate"
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   NODE_ENV=development
   PORT=5010
   MONGO_URI=mongodb://localhost:27017/ym-realestate
   JWT_SECRET=your_jwt_secret_key_change_this
   JWT_EXPIRE=30d
   
   # Google OAuth (get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5010/api/auth/google/callback
   
   SESSION_SECRET=your_session_secret_key
   FRONTEND_URL=http://localhost:5010
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Open the frontend**
   - Open `index.html` in a browser, or
   - Use a local server like Live Server (VS Code extension)

## 🌐 Production Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start` (NOT `nodemon`)

2. **Configure Environment Variables in Render Dashboard**
   ```env
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/api/auth/google/callback
   SESSION_SECRET=your_session_secret
   FRONTEND_URL=https://your-vercel-url.vercel.app
   VERCEL_FRONTEND_URL=https://your-vercel-url.vercel.app
   BASE_URL=https://your-render-url.onrender.com
   ```

3. **Important Notes**
   - The `start` script in `package.json` uses `node server.js` (not `nodemon`)
   - `nodemon` is only in `devDependencies` and used for local development
   - Render will automatically use the `PORT` environment variable
   - Make sure MongoDB Atlas allows connections from all IPs (0.0.0.0/0) or Render's IPs

### Frontend Deployment (Vercel)

1. **Create a new Project on Vercel**
   - Connect your GitHub repository
   - Set **Root Directory**: Leave empty (deploy from root)
   - Framework Preset: Other
   - Build Command: Leave empty
   - Output Directory: Leave empty

2. **Update API URLs**
   - In `js/api.js` and `login.html`, update the production API URL:
   ```javascript
   const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:5011/api'
     : 'https://your-render-backend.onrender.com/api';
   ```
   - Replace `https://your-render-backend.onrender.com/api` with your actual Render backend URL

3. **Configure CORS**
   - Add your Vercel deployment URL to the backend's allowed origins
   - The backend already supports Vercel domains with pattern matching
   - Update `VERCEL_FRONTEND_URL` in Render environment variables

### Cross-Origin Configuration

The application is configured to handle requests between:
- **Frontend** (Vercel): `https://your-site.vercel.app`
- **Backend** (Render): `https://your-api.onrender.com`

**Key Files to Update:**
1. `backend/server.js` - CORS configuration (already supports Vercel pattern)
2. `js/api.js` - Production API URL
3. `login.html` - Production API URL
4. Render Environment Variables - Set `FRONTEND_URL` and `VERCEL_FRONTEND_URL`

### Team Registration Codes

- **User Registration**: No code required
- **Team Registration**: Use code `YM2024TEAM`
- **Test Endpoint Team Registration**: Use code `YMTEAM2024`

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth 2.0)
- **File Uploads**: Multer
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📝 License

This project is for educational purposes.
   