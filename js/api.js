// ==========================================
// GLOBAL CONFIGURATION & AUTH HANDLER
// ==========================================

// 1. SMART API URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5011/api'
    : 'https://ym-real-estate.onrender.com/api';

// 2. UNIVERSAL UI UPDATER
const ui = {
    updateAuthStatus: function() {
        const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        const navLoginLink = document.getElementById('navLoginLink');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (userStr && token) {
            // LOGGED IN
            const user = JSON.parse(userStr);
            if (navLoginLink) navLoginLink.style.display = 'none'; 
            
            if (userProfile) {
                userProfile.style.display = 'flex'; 
                if (userName) userName.textContent = user.name || 'User';
                if (userAvatar) {
                    userAvatar.src = user.avatar || user.picture || 
                        `https://placehold.co/40x40/263f6e/ffffff?text=${(user.name || 'U').charAt(0).toUpperCase()}`;
                }
            }
        } else {
            // LOGGED OUT
            if (navLoginLink) navLoginLink.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }
};

// 3. GLOBAL LOGOUT FUNCTION
function logout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.clear(); // Wipes everything clean
        window.location.href = 'index.html';
    }
}

// 4. BACKWARD COMPATIBILITY BRIDGE (Crucial Fix)
// This makes "api.logout()" redirect to the real "logout()" function
const api = {
    logout: logout
};

// Make logout available globally on the window object
window.logout = logout;
window.api = api;

// 5. AUTO-RUN
document.addEventListener('DOMContentLoaded', () => {
    ui.updateAuthStatus();
});
