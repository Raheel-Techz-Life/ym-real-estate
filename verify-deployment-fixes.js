#!/usr/bin/env node

// Final Verification Script for Deployment Fixes

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('YM REAL ESTATE - DEPLOYMENT FIXES VERIFICATION');
console.log('='.repeat(70));
console.log();

let allChecks = true;

function safeReadFile(filePath, errorMsg) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`  ❌ ${errorMsg}: ${error.message}`);
    allChecks = false;
    return null;
  }
}

// Check 1: Package.json has correct scripts
console.log('✓ Checking package.json scripts...');
const packageJsonContent = safeReadFile(
  path.join(__dirname, 'backend/package.json'),
  'Failed to read backend/package.json'
);
if (!packageJsonContent) {
  console.log('  ❌ Cannot verify package.json');
} else {
  try {
    const packageJson = JSON.parse(packageJsonContent);
    if (packageJson.scripts.start === 'node server.js' && 
        packageJson.scripts.dev === 'nodemon server.js') {
      console.log('  ✅ Scripts configured correctly');
      console.log('     - start: node server.js');
      console.log('     - dev: nodemon server.js');
    } else {
      console.log('  ❌ Scripts not configured correctly');
      allChecks = false;
    }
  } catch (error) {
    console.log(`  ❌ Invalid JSON in package.json: ${error.message}`);
    allChecks = false;
  }
}

// Check 2: nodemon in devDependencies
console.log('\n✓ Checking nodemon location...');
const packageJson = packageJsonContent ? JSON.parse(packageJsonContent) : {};
if (packageJson.devDependencies?.nodemon && !packageJson.dependencies?.nodemon) {
  console.log('  ✅ nodemon in devDependencies only');
} else {
  console.log('  ❌ nodemon not properly configured');
  allChecks = false;
}

// Check 3: Rate limiting dependency
console.log('\n✓ Checking rate limiting...');
if (packageJson.dependencies['express-rate-limit']) {
  console.log('  ✅ express-rate-limit installed');
} else {
  console.log('  ❌ express-rate-limit missing');
  allChecks = false;
}

// Check 4: Server.js exists and is valid
console.log('\n✓ Checking server.js...');
const serverJs = safeReadFile(
  path.join(__dirname, 'backend/server.js'),
  'Failed to read backend/server.js'
);
if (!serverJs) {
  console.log('  ❌ Cannot verify server.js');
} else {
  if (serverJs.includes('express-rate-limit') && 
      serverJs.includes('authLimiter') &&
      serverJs.includes('apiLimiter')) {
    console.log('  ✅ Rate limiting configured in server.js');
  } else {
    console.log('  ❌ Rate limiting not configured in server.js');
    allChecks = false;
  }

  if (serverJs.includes('handleRegistration') && 
      serverJs.includes('handleLogin')) {
    console.log('  ✅ Shared auth handlers implemented');
  } else {
    console.log('  ❌ Shared auth handlers missing');
    allChecks = false;
  }

  if (serverJs.includes('/api/health')) {
    console.log('  ✅ Health check endpoint exists');
  } else {
    console.log('  ❌ Health check endpoint missing');
    allChecks = false;
  }
}

// Check 5: Frontend API URLs
console.log('\n✓ Checking frontend API URLs...');
const apiJs = safeReadFile(
  path.join(__dirname, 'js/api.js'),
  'Failed to read js/api.js'
);
const loginHtml = safeReadFile(
  path.join(__dirname, 'login.html'),
  'Failed to read login.html'
);

if (apiJs && apiJs.includes('https://ym-realestate-api.onrender.com/api')) {
  console.log('  ✅ Production API URL in js/api.js');
} else if (apiJs) {
  console.log('  ⚠️  Production API URL needs to be updated in js/api.js');
}

if (loginHtml && loginHtml.includes('https://ym-realestate-api.onrender.com/api')) {
  console.log('  ✅ Production API URL in login.html');
} else if (loginHtml) {
  console.log('  ⚠️  Production API URL needs to be updated in login.html');
}

// Check 6: CORS configuration
console.log('\n✓ Checking CORS configuration...');
if (serverJs && serverJs.includes('vercel.app') && 
    serverJs.match(/origin\.match\(/)) {
  console.log('  ✅ CORS pattern matching for Vercel');
} else {
  console.log('  ❌ CORS not properly configured');
  allChecks = false;
}

if (serverJs && serverJs.includes('NODE_ENV') && 
    serverJs.includes('Not allowed by CORS')) {
  console.log('  ✅ CORS rejects unauthorized origins in production');
} else if (serverJs) {
  console.log('  ❌ Production CORS security not configured');
  allChecks = false;
}

// Check 7: Auth endpoints
console.log('\n✓ Checking auth endpoints...');
if (serverJs && serverJs.includes("app.post('/api/register'") && 
    serverJs.includes("app.post('/api/auth/register'") &&
    serverJs.includes("app.post('/api/login'") && 
    serverJs.includes("app.post('/api/auth/login'")) {
  console.log('  ✅ All auth endpoints configured');
} else if (serverJs) {
  console.log('  ❌ Auth endpoints incomplete');
  allChecks = false;
}

// Check 8: Team codes
console.log('\n✓ Checking team codes...');
if (serverJs && serverJs.includes('YM2024TEAM') && serverJs.includes('YMTEAM2024')) {
  console.log('  ✅ Team codes configured');
  console.log('     - YM2024TEAM for /api/register');
  console.log('     - YMTEAM2024 for /api/register/team');
} else if (serverJs) {
  console.log('  ❌ Team codes not configured');
  allChecks = false;
}

// Check 9: Documentation
console.log('\n✓ Checking documentation...');
const files = ['README.md', 'DEPLOYMENT.md', 'DEPLOYMENT_QUICK_REFERENCE.md'];
let docsComplete = true;
files.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
    docsComplete = false;
    allChecks = false;
  }
});

// Check 10: Redirects after auth
console.log('\n✓ Checking auth redirects...');
if (loginHtml && loginHtml.includes("window.location.href = 'index.html'")) {
  console.log('  ✅ Redirects to index.html after auth');
} else if (loginHtml) {
  console.log('  ❌ Auth redirects not configured');
  allChecks = false;
}

// Summary
console.log();
console.log('='.repeat(70));
if (allChecks) {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
} else {
  console.log('❌ SOME CHECKS FAILED - Review issues above');
}
console.log('='.repeat(70));
console.log();

// Deployment reminders
console.log('DEPLOYMENT REMINDERS:');
console.log('1. Update production API URLs in js/api.js and login.html');
console.log('2. Set all environment variables in Render dashboard');
console.log('3. Deploy backend to Render (root: backend, start: npm start)');
console.log('4. Deploy frontend to Vercel (root: ., no build)');
console.log('5. Update Render env vars with Vercel URL');
console.log();
console.log('See DEPLOYMENT.md for detailed instructions.');
console.log();

process.exit(allChecks ? 0 : 1);
