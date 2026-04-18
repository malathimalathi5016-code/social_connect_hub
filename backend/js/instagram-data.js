// instagram-data.js - Display user's Instagram data
document.addEventListener('DOMContentLoaded', function() {
  loadInstagramData();
});

async function loadInstagramData() {
  const instagramSection = document.getElementById('instagramSection');
  const loginRequired = document.getElementById('loginRequired');
  const profileDiv = document.getElementById('instagramProfile');
  const mediaGrid = document.getElementById('mediaGrid');

  try {
    // Check if user is logged in with Instagram
    const response = await fetch(API_BASE_URL + '/api/instagram/user-data', {
      credentials: 'include'
    });
    const data = await response.json();

    if (response.ok && data.user) {
      // User is logged in with Instagram, show their data
      loginRequired.style.display = 'none';
      instagramSection.style.display = 'block';

      // Display profile info
      profileDiv.innerHTML = `
        <div class="profile-avatar">📷</div>
        <h2>@${data.user.username}</h2>
        <p>Instagram User ID: ${data.user.id}</p>
        <p>Welcome to your Instagram data dashboard! Here you can see your recent posts and media.</p>
      `;

      // Display media
      if (data.media && data.media.length > 0) {
        mediaGrid.innerHTML = data.media.map(media => `
          <div class="media-item">
            ${media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM' ?
              `<img src="${media.media_url}" alt="Instagram post" class="media-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'">` :
              `<video class="media-image" controls><source src="${media.media_url}" type="video/mp4">Video not supported</video>`
            }
            <div class="media-content">
              <div class="media-caption">${media.caption || 'No caption'}</div>
              <div class="media-meta">
                Posted: ${new Date(media.timestamp).toLocaleDateString()}
                <br>
                Type: ${media.media_type}
                ${media.permalink ? `<br><a href="${media.permalink}" target="_blank">View on Instagram</a>` : ''}
              </div>
            </div>
          </div>
        `).join('');
      } else {
        mediaGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 50px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>No posts found</h3>
            <p>You don't have any public posts, or they may not be accessible through the Instagram Basic Display API.</p>
          </div>
        `;
      }

    } else {
      // User is not logged in with Instagram
      instagramSection.style.display = 'none';
      loginRequired.style.display = 'block';
    }

  } catch (error) {
    console.error('Error loading Instagram data:', error);
    instagramSection.style.display = 'none';
    loginRequired.style.display = 'block';

    // Show error message
    loginRequired.innerHTML = `
      <h2>Error Loading Data</h2>
      <p>There was an error loading your Instagram data. Please try logging in again.</p>
      <button onclick="location.href='login.html'" style="background: #E4405F; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px;">Login with Instagram</button>
      <button onclick="location.href='index.html'" style="background: #666; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">Back to Home</button>
    `;
  }
}