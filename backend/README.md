# Y.M. Real Estate Backend API

## Features
- ✅ User Authentication (Email/Password + Google OAuth)
- ✅ Property CRUD Operations
- ✅ Property Search & Filtering
- ✅ Contact Form Submission
- ✅ Property Inquiries
- ✅ Image Upload Support
- ✅ MongoDB Data Storage

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the backend folder with:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ym-realestate
   JWT_SECRET=your_jwt_secret_key_change_this
   JWT_EXPIRE=30d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   SESSION_SECRET=your_session_secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Seed Database (Optional):**
   ```bash
   npm run seed
   ```
   This creates sample properties and an admin user:
   - Email: admin@ymrealestate.com
   - Password: admin123

5. **Start Server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user (Protected)

### Properties
- `GET /api/properties` - Get all properties (supports filters)
  - Query params: `city`, `propertyType`, `status`, `minPrice`, `maxPrice`, `bedrooms`
- `GET /api/properties/:id` - Get single property with full details
- `GET /api/properties/featured` - Get featured properties
- `POST /api/properties` - Create property (Protected)
- `PUT /api/properties/:id` - Update property (Protected)
- `DELETE /api/properties/:id` - Delete property (Protected)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (Admin only)
- `PUT /api/contact/:id` - Update message status (Admin only)

### Inquiries
- `POST /api/inquiries` - Submit property inquiry
- `GET /api/inquiries` - Get all inquiries (Admin only)
- `PUT /api/inquiries/:id` - Update inquiry status (Admin only)

## Testing with Postman/Thunder Client

### 1. Register User
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91-9876543210"
}
```

### 2. Login
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ymrealestate.com",
  "password": "admin123"
}
```

### 3. Get Properties
