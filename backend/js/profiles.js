// profiles.js - Profiles display functionality
let currentFavorites = [];

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const profilesSection = document.getElementById("profilesSection");
  const loginRequired = document.getElementById("loginRequired");

  if (currentUser) {
    if (profilesSection) profilesSection.style.display = "block";
    if (loginRequired) loginRequired.style.display = "none";
    if (currentUser.email && currentUser.email !== 'null') {
      loadFavorites(currentUser.email);
    }
    loadProfiles();
  } else {
    if (profilesSection) profilesSection.style.display = "none";
    if (loginRequired) loginRequired.style.display = "block";
  }
});

function loadFavorites(email) {
  fetch(API_BASE_URL + `/api/favorites/${email}`)
    .then(response => response.json())
    .then(data => {
      currentFavorites = Array.isArray(data) ? data : [];
    })
    .catch(error => {
      console.error('Error loading favorites:', error);
      currentFavorites = [];
    });
}

function loadProfiles() {
  fetch(API_BASE_URL + '/api/influencers')
    .then(response => response.json())
    .then(influencers => {
      const listDiv = document.getElementById("profilesList");

      if (!listDiv) return;

      if (influencers.length === 0) {
        listDiv.innerHTML = "<p>No profiles uploaded yet.</p>";
        return;
      }

      listDiv.innerHTML = influencers.map(inf => {
        const isFavorited = isFavorite(inf.name, inf.platform);
        const email = inf.collaboration_email || inf.collaborationEmail || '';

        return `<div class="card">
          <div class="card-header">
            <h3>${inf.name}</h3>
            <button class="star-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${inf.name}', '${inf.platform}')">⭐</button>
          </div>
          <p><strong>Platform:</strong> ${inf.platform}</p>
          <p><strong>Followers:</strong> ${inf.followers}</p>
          <p><strong>Promotions:</strong> ${inf.promotions}</p>
          <p><strong>Profile Link:</strong> ${inf.profile_url ? `<a href="${inf.profile_url}" target="_blank">Visit profile</a>` : 'Not provided'}</p>
          <p><strong>Collaboration Email:</strong> ${email || 'Not provided'}</p>
          <button class="contact-btn" onclick="contactInfluencer('${email}', '${inf.name}')">📧 Contact</button>
        </div>`;
      }).join("");
    })
    .catch(error => {
      console.error('Error loading profiles:', error);
      const listDiv = document.getElementById("profilesList");
      if (listDiv) listDiv.innerHTML = "<p>Error loading profiles.</p>";
    });
}

function contactInfluencer(email, name) {
  const subject = `Collaboration Opportunity with ${name}`;
  const body = `Hello ${name},\n\nI'm interested in collaborating with you. Let's discuss the details.\n\nBest regards`;
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function isFavorite(name, platform) {
  return currentFavorites.some(fav => fav.name === name && fav.platform === platform);
}

function toggleFavorite(name, platform) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.email || currentUser.email === 'null') {
    alert("Please login to favorite influencers!");
    return;
  }

  fetch(API_BASE_URL + `/api/favorites/${currentUser.email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, platform }),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      if (currentUser.email && currentUser.email !== 'null') {
        loadFavorites(currentUser.email);
      }
      loadProfiles();
    })
    .catch(error => {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    });
}
