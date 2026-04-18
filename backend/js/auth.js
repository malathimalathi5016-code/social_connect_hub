// auth.js - Common authentication and UI updates
document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
});

async function checkAuthentication() {
  const logoutLink = document.getElementById("logoutLink");
  const adminLink = document.getElementById("adminLink");
  const welcomeDiv = document.getElementById("welcome");
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  const registerLinks = document.querySelectorAll('a[href="register.html"]');

  try {
    // First, check for Instagram user session
    const instagramResponse = await fetch(API_BASE_URL + '/api/instagram/user-data', {
      credentials: 'include'
    });
    const instagramData = await instagramResponse.json();

    if (instagramResponse.ok && instagramData.user) {
      // User is logged in with Instagram
      const instagramUser = {
        username: instagramData.user.username,
        email: null,
        is_admin: false,
        is_instagram_user: true
      };

      localStorage.setItem("currentUser", JSON.stringify(instagramUser));
      updateUIForLoggedInUser(instagramUser);
      return;
    }
  } catch (error) {
    console.log('Instagram session check failed, checking regular login...');
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/current-user', {
      credentials: 'include'
    });
    const data = await response.json();

    if (response.ok && data.user) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      updateUIForLoggedInUser(data.user);
      return;
    }
  } catch (error) {
    console.log('Regular session check failed:', error);
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    updateUIForLoggedInUser(currentUser);
  } else {
    updateUIForLoggedOutUser();
  }
}

function updateUIForLoggedInUser(user) {
  const logoutLink = document.getElementById("logoutLink");
  const adminLink = document.getElementById("adminLink");
  const instagramDataLink = document.getElementById("instagramDataLink");
  const welcomeDiv = document.getElementById("welcome");
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  const registerLinks = document.querySelectorAll('a[href="register.html"]');

  // Hide login and register links
  loginLinks.forEach(link => link.style.display = "none");
  registerLinks.forEach(link => link.style.display = "none");

  // Show logout link
  if (logoutLink) logoutLink.style.display = "inline";

  // Show Instagram Data link only for Instagram users
  if (instagramDataLink) {
    if (user.is_instagram_user) {
      instagramDataLink.style.display = "inline";
    } else {
      instagramDataLink.style.display = "none";
    }
  }

  // Show admin link only for admin users
  const isAdmin = user.is_admin === true || localStorage.getItem("isAdmin") === "true";
  if (adminLink && isAdmin) {
    adminLink.style.display = "inline";
  } else if (adminLink) {
    adminLink.style.display = "none";
  }

  // Show welcome message
  if (welcomeDiv) {
    const userType = user.is_instagram_user ? ' (Instagram)' : '';
    welcomeDiv.innerHTML = `<p>Welcome, ${user.username}${userType}!</p>`;
  }
}

function updateUIForLoggedOutUser() {
  const logoutLink = document.getElementById("logoutLink");
  const adminLink = document.getElementById("adminLink");
  const instagramDataLink = document.getElementById("instagramDataLink");
  const welcomeDiv = document.getElementById("welcome");
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  const registerLinks = document.querySelectorAll('a[href="register.html"]');

  // Show login and register links
  loginLinks.forEach(link => link.style.display = "inline");
  registerLinks.forEach(link => link.style.display = "inline");

  // Hide logout link
  if (logoutLink) logoutLink.style.display = "none";

  // Hide Instagram data link
  if (instagramDataLink) instagramDataLink.style.display = "none";

  // Hide admin link
  if (adminLink) adminLink.style.display = "none";

  // Clear welcome message
  if (welcomeDiv) welcomeDiv.innerHTML = "";
}

// Logout function (can be called from logout.html)
async function logout() {
  try {
    // Try Instagram logout first
    await fetch(API_BASE_URL + '/api/instagram/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.log('Instagram logout failed or not logged in with Instagram');
  }

  try {
    await fetch(API_BASE_URL + '/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.log('Logout error:', error);
  }

  // Clear localStorage
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAdmin");

  // Update UI
  updateUIForLoggedOutUser();

  // Redirect to home
  window.location.href = "index.html";
}