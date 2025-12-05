// Theme Management System

(function() {
  const THEME_KEY = 'ym-theme';
  
  // Get saved theme or detect system preference
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  // Apply theme to document
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f1419' : '#ffffff');
    }
  }
  
  // Toggle between themes
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }
  
  // Initialize theme on page load
  function initTheme() {
    const theme = getPreferredTheme();
    applyTheme(theme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
  
  // Create and inject theme toggle button
  function createThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = '<i class="fas fa-moon"></i><i class="fas fa-sun"></i>';
    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      createThemeToggle();
    });
  } else {
    initTheme();
    createThemeToggle();
  }
  
  // Apply theme immediately to prevent flash
  initTheme();
  
  // Expose for external use
  window.themeManager = { toggleTheme, applyTheme, getPreferredTheme };
})();
