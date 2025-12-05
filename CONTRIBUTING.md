# Contributing to Y M Real Estate

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ym-real-estate.git
   cd ym-real-estate
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your MongoDB URI, JWT secrets, and Google OAuth credentials

4. **Start development**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend (use live server or http-server)
   npx http-server -p 8000
   ```

## Project Structure

