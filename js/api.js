// API Configuration
const API_URL = 'http://localhost:5010/api'; // Change 5010 to your actual port

// Authentication State
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// API Service Functions
const api = {
    // Properties
    async getProperties() {
        try {
            const response = await fetch(`${API_URL}/properties`);
            if (!response.ok) throw new Error('Failed to fetch properties');
            return await response.json();
        } catch (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }
    },

    async addProperty(propertyData) {
        try {
            const response = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(propertyData)
            });
            if (!response.ok) throw new Error('Failed to add property');
            return await response.json();
        } catch (error) {
            console.error('Error adding property:', error);
            throw error;
        }
    },

    // Authentication
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Invalid credentials');
            const data = await response.json();
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) throw new Error('Registration failed');
            const data = await response.json();
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async logout() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        ui.updateAuthStatus();
        // Don't reload - let updateAuthStatus handle the UI update
        // Then redirect to home after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    },

    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!response.ok) throw new Error('Failed to send reset email');
            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    // Contact
    async sendContactMessage(contactData) {
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
            if (!response.ok) throw new Error('Failed to send message');
            return await response.json();
        } catch (error) {
            console.error('Contact error:', error);
            throw error;
        }
    }
};

// UI Functions
const ui = {
    displayProperties(containerId, properties) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = properties.map(property => `
            <div class="property-card">
                <div class="property-image">
                    <img src="${property.images[0] || 'placeholder.jpg'}" alt="${property.title}">
                </div>
                <div class="property-details">
                    <h3>${property.title}</h3>
                    <p class="price">$${property.price.toLocaleString()}</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    <div class="features">
                        <span><i class="fas fa-bed"></i> ${property.features.bedrooms} beds</span>
                        <span><i class="fas fa-bath"></i> ${property.features.bathrooms} baths</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.features.area} sqft</span>
                    </div>
                    <p class="description">${property.description}</p>
                    <button onclick="showPropertyDetails('${property._id}')" class="view-details">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    },

    showLoginForm() {
        // Implementation depends on your HTML structure
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'block';
    },

    updateAuthStatus() {
        const userProfile = document.getElementById('userProfile');
        const navLoginLink = document.getElementById('navLoginLink');

        if (currentUser) {
            if (userProfile) {
                userProfile.style.display = 'flex';
            }
            if (navLoginLink) {
                navLoginLink.style.display = 'none';
            }
            
            const userNameEl = document.getElementById('userName');
            const userAvatarEl = document.getElementById('userAvatar');
            
            if (userNameEl) {
                userNameEl.textContent = currentUser.name;
            }
            
            if (userAvatarEl) {
                if (currentUser.picture) {
                    userAvatarEl.src = currentUser.picture;
                }
                else if (currentUser.avatar && currentUser.avatar.startsWith('http')) {
                    userAvatarEl.src = currentUser.avatar;
                } 
                else {
                    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DFE6E9', 'A29BFE', 'FD79A8'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const avatarStyle = Math.random() > 0.5 ? 'avataaars' : 'bottts';
                    userAvatarEl.src = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${currentUser.email}&backgroundColor=${randomColor}`;
                }
            }
        } else {
            if (userProfile) {
                userProfile.style.display = 'none';
            }
            if (navLoginLink) {
                navLoginLink.style.display = 'flex';
            }
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Update auth status
        ui.updateAuthStatus();

        // Load and display properties
        const properties = await api.getProperties();
        ui.displayProperties('featuredProperties', properties);

        // Set up contact form listener
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(contactForm);
                    const contactData = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        message: formData.get('message')
                    };
                    await api.sendContactMessage(contactData);
                    alert('Message sent successfully!');
                    contactForm.reset();
                } catch (error) {
                    alert('Failed to send message: ' + error.message);
                }
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});