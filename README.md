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
   