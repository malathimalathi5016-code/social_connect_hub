// upload.js - Profile upload functionality
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const uploadSection = document.getElementById("uploadSection");
  const loginRequired = document.getElementById("loginRequired");

  if (currentUser) {
    if (uploadSection) uploadSection.style.display = "block";
    if (loginRequired) loginRequired.style.display = "none";
  } else {
    if (uploadSection) uploadSection.style.display = "none";
    if (loginRequired) loginRequired.style.display = "block";
  }

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      const profile = {
        name: document.getElementById("name").value,
        platform: document.getElementById("platform").value,
        followers: parseInt(document.getElementById("followers").value),
        promotions: document.getElementById("promotions").value,
        profileUrl: document.getElementById("profileUrl").value,
        collaborationEmail: document.getElementById("collaborationEmail").value
      };

      try {
        const response = await fetch(API_BASE_URL + '/api/influencers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          profileForm.reset();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    });
  }
});