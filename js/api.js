// ==========================================
// GLOBAL CONFIGURATION & AUTH HANDLER
// ==========================================

// 1. SMART API URL (Auto-detects Localhost vs Render)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5011/api'
    : 'https://ym-real-estate.onrender.com/api';

// 2. UNIVERSAL UI UPDATER
const ui = {
    updateAuthStatus: function() {
        // Check both possible storage keys
        const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        // Get HTML Elements
        const navLoginLink = document.getElementById('navLoginLink');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (userStr && token) {
            // --- USER IS LOGGED IN ---
            const user = JSON.parse(userStr);
            console.log("✅ Logged in as:", user.name);

            if (navLoginLink) navLoginLink.style.display = 'none'; // Hide Login button
            
            if (userProfile) {
                userProfile.style.display = 'flex'; // Show Profile
                if (userName) userName.textContent = user.name || 'User';
                
                // Set Avatar (or Initials fallback)
                if (userAvatar) {
                    userAvatar.src = user.avatar || user.picture || 
                        `https://placehold.co/40x40/263f6e/ffffff?text=${(user.name || 'U').charAt(0).toUpperCase()}`;
                }
            }
        } else {
            // --- USER IS LOGGED OUT ---
            if (navLoginLink) navLoginLink.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }
};

// 3. GLOBAL LOGOUT FUNCTION
function logout() {
    if(confirm("Are you sure you want to logout?")) {
        // Clear all possible keys
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        // Go to home and refresh
        window.location.href = 'index.html';
    }
}

// 4. AUTO-RUN ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    ui.updateAuthStatus();
});
