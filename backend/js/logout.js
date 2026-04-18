// logout.js - Logout logic
document.addEventListener('DOMContentLoaded', async function() {
  // Use the logout function from auth.js
  if (typeof logout === 'function') {
    await logout();
  } else {
    // Fallback if auth.js is not loaded
    console.log('Auth.js logout function not available, using fallback...');

    // Clear localStorage
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");

    // Try to logout from backend if possible
    try {
      const baseURL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000';
      await fetch(baseURL + '/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'unknown' }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Redirect to home
    window.location.href = "index.html";
  }
});