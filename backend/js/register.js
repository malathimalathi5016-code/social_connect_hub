// register.js - Registration form handling
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      const user = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      };

      try {
        const response = await fetch(API_BASE_URL + '/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          window.location.href = "login.html";
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }
});