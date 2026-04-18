// admin.js - Admin dashboard logic
document.addEventListener('DOMContentLoaded', async function() {
  if (localStorage.getItem("isAdmin") !== "true") {
    alert('Access denied');
    window.location.href = 'index.html';
    return;
  }
  const currentUser = await getCurrentUser();
  const adminSection = document.getElementById("adminSection");
  const loginRequired = document.getElementById("loginRequired");
  const adminDenied = document.getElementById("adminDenied");

  if (currentUser) {
    const isAdmin = currentUser.is_admin === true;
    if (isAdmin) {
      if (adminSection) adminSection.style.display = "block";
      if (loginRequired) loginRequired.style.display = "none";
      if (adminDenied) adminDenied.style.display = "none";

      fetch(API_BASE_URL + '/api/admin/stats', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
          const totalUsersEl = document.getElementById("totalUsers");
          const activeUsersEl = document.getElementById("activeUsers");
          const totalProfilesEl = document.getElementById("totalProfiles");

          if (totalUsersEl) totalUsersEl.textContent = data.totalUsers;
          if (activeUsersEl) activeUsersEl.textContent = data.activeUsers;
          if (totalProfilesEl) totalProfilesEl.textContent = data.totalProfiles;
          const instagramProfilesEl = document.getElementById("instagramProfiles");
          const youtubeProfilesEl = document.getElementById("youtubeProfiles");
          if (instagramProfilesEl) instagramProfilesEl.textContent = data.instagramProfiles || 0;
          if (youtubeProfilesEl) youtubeProfilesEl.textContent = data.youtubeProfiles || 0;

          createUserChart(data.totalUsers, data.activeUsers);
          createPlatformChart(data);
        })
        .catch(error => {
          console.error('Error loading admin stats:', error);
        });
    } else {
      if (adminSection) adminSection.style.display = "none";
      if (loginRequired) loginRequired.style.display = "none";
      if (adminDenied) adminDenied.style.display = "block";
    }
  } else {
    if (adminSection) adminSection.style.display = "none";
    if (loginRequired) loginRequired.style.display = "block";
    if (adminDenied) adminDenied.style.display = "none";
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2500);
  }
});

async function getCurrentUser() {
  try {
    const response = await fetch(API_BASE_URL + '/api/current-user', {
      credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.user) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      return data.user;
    }
  } catch (error) {
    console.error('Unable to verify current user:', error);
  }

  const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (storedUser) {
    return storedUser;
  }
  return null;
}

function createUserChart(totalUsers, activeUsers) {
  const ctx = document.getElementById('userChart');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Total Users', 'Active Users'],
        datasets: [{
          label: 'User Count',
          data: [totalUsers, activeUsers],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

function createPlatformChart(data) {
  fetch(API_BASE_URL + '/api/admin/chart-data', { credentials: 'include' })
    .then(response => response.json())
    .then(chartData => {
      const ctx = document.getElementById('platformChart');
      if (ctx) {
        new Chart(ctx.getContext('2d'), {
          type: 'pie',
          data: {
            labels: Object.keys(chartData.platformStats),
            datasets: [{
              data: Object.values(chartData.platformStats),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 205, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading chart data:', error);
    });
}