// Theme Toggle Functionality
(function() {
  const themeKey = 'vulnshop-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Get saved theme or use system preference
  const savedTheme = localStorage.getItem(themeKey);
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply theme
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeKey, theme);
    updateThemeIcon(theme);
  }
  
  // Update theme icon
  function updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }
  
  // Initialize theme
  applyTheme(initialTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(themeKey)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
  
  // Theme toggle button handler
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    }
  });
  
  // Export for manual control
  window.VulnShopTheme = {
    set: applyTheme,
    get: () => document.documentElement.getAttribute('data-theme')
  };
})();
