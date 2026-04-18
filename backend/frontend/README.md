# Social Connect Hub

A full-stack web application for connecting brands with social media influencers. The platform allows users to search, favorite, and contact influencers across various social media platforms.

## Project Structure

```
social_connect_hub/
├── backend/                    # Python Flask Backend
│   ├── Main.py                # Main Flask application
│   ├── Evaluation.ts          # System evaluation and metrics
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
├── js/                        # Frontend JavaScript (separated)
│   ├── auth.js                # Authentication & UI updates
│   ├── theme.js               # Dark/light theme toggle
│   ├── login.js               # Login form handling
│   ├── register.js            # Registration form handling
│   ├── logout.js              # Logout logic
│   ├── admin.js               # Admin dashboard
│   ├── search.js              # Influencer search
│   ├── profiles.js            # Profile display
│   ├── upload.js              # Profile upload
│   ├── favorites.js           # Favorites management
│   └── instagram-data.js      # Instagram data display (NEW)
├── *.html                     # HTML pages
│   ├── instagram-data.html    # Instagram data page (NEW)
├── style.css                  # CSS styles
└── README.md                  # This file
```

## Features

- 🔐 **Dual Authentication**: Regular email/password login + Instagram OAuth
- 📸 **Instagram Integration**: Login with Instagram and access user data
- 🔍 **Influencer Search**: Advanced search with filters (platform, followers, category)
- ⭐ **Favorites System**: Save and manage favorite influencers
- 👑 **Admin Dashboard**: User management and system statistics
- 🎨 **Dark/Light Theme**: User preference-based theming
- 📱 **Responsive Design**: Mobile-friendly interface

## Instagram Integration

### How It Works
1. **OAuth Flow**: Users click "Login with Instagram" → redirected to Instagram → grant permissions → redirected back
2. **Data Access**: App can fetch user's profile info and recent media posts
3. **Session Management**: Instagram sessions are maintained server-side with Flask sessions

### New Files Added
- `instagram-data.html` - Dedicated page to display user's Instagram data
- `instagram-data.js` - JavaScript to fetch and display Instagram media
- Updated `auth.js` - Enhanced to handle Instagram user sessions
- Updated `login.html` - Added Instagram login button
- Updated navigation - "My Instagram Data" link for Instagram users

### API Endpoints Used
- `GET /api/instagram/login` - Initiate OAuth flow
- `GET /api/instagram/callback` - Handle OAuth callback
- `GET /api/instagram/user-data` - Fetch user's Instagram data
- `POST /api/instagram/logout` - Logout Instagram user

- **User Authentication**: Register, login, logout functionality
- **Influencer Management**: Upload and browse influencer profiles
- **Search & Filter**: Advanced search with platform and follower filters
- **Favorites System**: Save favorite influencers
- **Admin Dashboard**: Analytics and system statistics
- **Dark/Light Theme**: User preference-based theming
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

### Backend
- **Python Flask**: Web framework
- **SQLite**: Database
- **Flask-CORS**: Cross-origin resource sharing
- **Werkzeug**: Password hashing

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling
- **Vanilla JavaScript**: Interactivity
- **Chart.js**: Data visualization

## Setup Instructions

### Prerequisites
- Python 3.7+
- Node.js (optional, for future enhancements)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask server:**
   ```bash
   python Main.py
   ```

   The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Open the main directory:**
   ```bash
   cd /path/to/social_connect_hub
   ```

2. **Serve the HTML files:**
   - Use any static file server, or
   - Open `index.html` directly in a browser (for localStorage fallback)
   - For full functionality, ensure backend is running

3. **Access the application:**
   - Open `http://localhost:5000` (if using a server that proxies)
   - Or open HTML files directly and configure API calls

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Influencers
- `GET /api/influencers` - Get all influencers
- `POST /api/influencers` - Add new influencer

### Favorites
- `GET /api/favorites/<email>` - Get user favorites
- `POST /api/favorites/<email>` - Add/remove favorite

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/chart-data` - Chart data

## Database Schema

- **users**: User accounts (id, username, email, password)
- **influencers**: Influencer profiles (id, name, platform, followers, promotions, collaboration_email)
- **favorites**: User favorites (id, user_email, influencer_name, influencer_platform)
- **active_users**: Currently logged in users (id, username, login_time)

## Development

### Running Tests
- Backend: Use pytest for API testing
- Frontend: Manual testing with browser dev tools

### Deployment
- Backend: Deploy Flask app to Heroku, AWS, or similar
- Frontend: Static hosting on Netlify, Vercel, or CDN
- Database: Consider PostgreSQL for production

## Future Enhancements

- User profiles and avatars
- Direct messaging between users and influencers
- Payment integration for collaborations
- Advanced analytics and reporting
- Mobile app development
- AI-powered influencer matching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.