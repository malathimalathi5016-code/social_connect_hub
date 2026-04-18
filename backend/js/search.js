// search.js - Search functionality
let currentResults = [];
let currentFavorites = [];

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const searchSection = document.getElementById("searchSection");
  const loginRequired = document.getElementById("loginRequired");

  if (currentUser) {
    if (searchSection) searchSection.style.display = "block";
    if (loginRequired) loginRequired.style.display = "none";
    if (currentUser.email && currentUser.email !== 'null') {
      loadFavorites(currentUser.email);
    }
    showInitialMessage();
  } else {
    if (searchSection) searchSection.style.display = "none";
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

function searchInfluencers() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const platform = document.getElementById("platformFilter").value;
  const minFollowers = parseInt(document.getElementById("minFollowers").value) || 0;
  const keyword = document.getElementById("keywordFilter").value.toLowerCase();

  const resultsDiv = document.getElementById("results");
  if (resultsDiv) resultsDiv.innerHTML = "<p>Searching...</p>";

  const params = new URLSearchParams({
    q: query,
    platform: platform,
    min_followers: minFollowers.toString(),
    per_page: '20',
    page: '1'
  });

  fetch(API_BASE_URL + '/api/search?' + params)
    .then(response => response.json())
    .then(data => {
      currentResults = data.influencers || [];
      displayResults(currentResults, query, keyword);
      if (data.total > data.per_page) {
        showPagination(data);
      }
    })
    .catch(error => {
      console.error('Error searching influencers:', error);
      const resultsDiv = document.getElementById("results");
      if (resultsDiv) resultsDiv.innerHTML = "<p>Error searching influencers. Please try again.</p>";
    });
}

function sortInfluencers(order) {
  if (currentResults.length === 0) {
    searchInfluencers();
    return;
  }

  currentResults.sort((a, b) => {
    if (order === 'asc') {
      return a.followers - b.followers;
    }
    return b.followers - a.followers;
  });

  const query = document.getElementById("searchInput").value.toLowerCase();
  const keyword = document.getElementById("keywordFilter").value.toLowerCase();
  displayResults(currentResults, query, keyword);
}

function displayResults(results, query, keyword) {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No influencers found.</p>";
    return;
  }

  resultsDiv.innerHTML = results.map(inf => {
    const highlightedName = highlightText(inf.name, query);
    const highlightedPromotions = highlightText(inf.promotions, keyword);
    const contactEmail = inf.collaborationEmail || inf.collaboration_email || generateContactEmail(inf.name);
    const isFavorited = isFavorite(inf.name, inf.platform);

    return `<div class="card">
      <div class="card-header">
        <h3>${highlightedName}</h3>
        <button class="star-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${inf.name}', '${inf.platform}')">⭐</button>
      </div>
      <p><strong>Platform:</strong> ${inf.platform}</p>
      <p><strong>Followers:</strong> ${inf.followers.toLocaleString()}</p>
      <p><strong>Promotions:</strong> ${highlightedPromotions}</p>
      <p><strong>Collaboration Email:</strong> ${contactEmail}</p>
      <button class="contact-btn" onclick="contactInfluencer('${contactEmail}', '${inf.name}')">📧 Contact</button>
    </div>`;
  }).join("");
}

function highlightText(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

function generateContactEmail(influencerName) {
  return influencerName.toLowerCase().replace(/\s+/g, '.') + '@influencer.social';
}

function contactInfluencer(email, name) {
  const subject = encodeURIComponent('Brand Collaboration Proposal');
  const body = encodeURIComponent(`Hi ${name},\n\nI'm interested in exploring a potential collaboration with you.\n\nLooking forward to hearing from you!\n\nBest regards`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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
      loadFavorites(currentUser.email);
      searchInfluencers();
    })
    .catch(error => {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    });
}

function showPagination(data) {
  const paginationDiv = document.getElementById("pagination") || createPaginationDiv();
  paginationDiv.innerHTML = "";

  const { page, total_pages } = data;

  if (page > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => loadPage(page - 1);
    paginationDiv.appendChild(prevBtn);
  }

  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(total_pages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = i === page ? "active" : "";
    pageBtn.onclick = () => loadPage(i);
    paginationDiv.appendChild(pageBtn);
  }

  if (page < total_pages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => loadPage(page + 1);
    paginationDiv.appendChild(nextBtn);
  }
}

function createPaginationDiv() {
  const paginationDiv = document.createElement("div");
  paginationDiv.id = "pagination";
  paginationDiv.className = "pagination";
  document.getElementById("results").appendChild(paginationDiv);
  return paginationDiv;
}

function loadPage(pageNum) {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const platform = document.getElementById("platformFilter").value;
  const minFollowers = parseInt(document.getElementById("minFollowers").value) || 0;
  const keyword = document.getElementById("keywordFilter").value.toLowerCase();

  const params = new URLSearchParams({
    q: query,
    platform: platform,
    min_followers: minFollowers.toString(),
    per_page: '20',
    page: pageNum.toString()
  });

  const resultsDiv = document.getElementById("results");
  if (resultsDiv) resultsDiv.innerHTML = "<p>Loading...</p>";

  fetch(API_BASE_URL + '/api/search?' + params)
    .then(response => response.json())
    .then(data => {
      currentResults = data.influencers || [];
      displayResults(currentResults, query, keyword);
      showPagination(data);
    })
    .catch(error => {
      console.error('Error loading page:', error);
      if (resultsDiv) resultsDiv.innerHTML = "<p>Error loading page. Please try again.</p>";
    });
}

function showInitialMessage() {
  const resultsDiv = document.getElementById("results");
  if (resultsDiv) {
    resultsDiv.innerHTML = "<p style='text-align: center; color: #666; font-style: italic;'>Enter your search criteria above and click 'Search' to find influencers.</p>";
  }
}
