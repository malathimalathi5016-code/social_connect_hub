// login.js - Login form handling
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(API_BASE_URL + '/api/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          if (data.user.is_admin) {
            localStorage.setItem("isAdmin", "true");
            alert('Admin login successful. Welcome to the admin controls.');
            window.location.href = "admin.html";
          } else {
            localStorage.removeItem("isAdmin");
            alert(data.message);
            window.location.href = "index.html";
          }
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    });
  }

  // Instagram Login Handler
  const instagramLoginBtn = document.getElementById('instagramLoginBtn');
  if (instagramLoginBtn) {
    instagramLoginBtn.addEventListener('click', function() {
      // Redirect to Instagram OAuth
      window.location.href = API_BASE_URL + '/api/instagram/login';
    });
  }
});