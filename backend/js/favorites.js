// favorites.js - Favorites display functionality
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const favoritesSection = document.getElementById("favoritesSection");
  const loginRequired = document.getElementById("loginRequired");

  if (currentUser) {
    if (favoritesSection) favoritesSection.style.display = "block";
    if (loginRequired) loginRequired.style.display = "none";
    loadFavorites();
  } else {
    if (favoritesSection) favoritesSection.style.display = "none";
    if (loginRequired) loginRequired.style.display = "block";
  }
});

function loadFavorites() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  fetch(API_BASE_URL + `/api/favorites/${currentUser.email}`)
    .then(response => response.json())
    .then(favoriteInfluencers => {
      const listDiv = document.getElementById("favoritesList");

      if (!listDiv) return;

      if (favoriteInfluencers.length === 0) {
        listDiv.innerHTML = "<div class='no-favorites'><h3>No favorites yet!</h3><p>Go to the search page and star some influencers you like.</p><button onclick='location.href=\"search.html\"'>Start Searching</button></div>";
      } else {
        listDiv.innerHTML = favoriteInfluencers.map(inf => `
          <div class="card">
            <div class="card-header">
              <h3>${inf.name}</h3>
              <button class="star-btn favorited" onclick="toggleFavorite('${inf.name}', '${inf.platform}')">⭐</button>
            </div>
            <p><strong>Platform:</strong> ${inf.platform}</p>
            <p><strong>Followers:</strong> ${inf.followers.toLocaleString()}</p>
            <p><strong>Promotions:</strong> ${inf.promotions}</p>
            <p><strong>Collaboration Email:</strong> ${inf.collaboration_email || 'Not provided'}</p>
            <button class="contact-btn" onclick="contactInfluencer('${inf.collaboration_email || generateContactEmail(inf.name)}', '${inf.name}')">📧 Contact</button>
          </div>
        `).join("");
      }
    })
    .catch(error => {
      console.error('Error loading favorites:', error);
      const listDiv = document.getElementById("favoritesList");
      if (listDiv) listDiv.innerHTML = "<p>Error loading favorites.</p>";
    });
}

function toggleFavorite(name, platform) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

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
    loadFavorites(); // Refresh the display
  })
  .catch(error => {
    console.error('Error toggling favorite:', error);
    alert('Failed to update favorite. Please try again.');
  });
}

function generateContactEmail(influencerName) {
  return influencerName.toLowerCase().replace(/\s+/g, '.') + '@influencer.social';
}

function contactInfluencer(email, name) {
  const subject = encodeURIComponent('Brand Collaboration Proposal');
  const body = encodeURIComponent(`Hi ${name},\n\nI'm interested in exploring a potential collaboration with you.\n\nLooking forward to hearing from you!\n\nBest regards`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}