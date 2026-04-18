# Flask Backend for Social Connect Hub

This backend serves the frontend and provides API endpoints for authentication, influencer search, favorites, admin stats, and Instagram mock login.

## Setup

1. Open a terminal in the repository root folder:

```powershell
cd C:\Users\malathi\OneDrive\Desktop\social_connect_hub
```

2. If you are using the project virtual environment, activate it first:

```powershell
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r backend\requirements.txt
```

4. No database environment variables are required. The app uses a local SQLite file by default.

Optional configuration:

```powershell
$env:FLASK_SECRET_KEY = "<your_flask_secret_key>"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "<admin_password>"
```

5. Start the server from the `backend` folder:

```powershell
cd backend
python Main.py
```

Alternatively, from the project root you can use the included helper scripts:

```powershell
.\run_backend.bat
```

or

```powershell
.\run_backend.ps1
```

6. Open the site in your browser:

```text
http://localhost:5000
```

> Important: Do not open the HTML files directly from the file system. Always access the app through the Flask server at `http://localhost:5000` so the frontend can call the backend APIs correctly.

> Note: The backend now uses local SQLite by default, so no external database connection string is required.

## Database Notes

- The backend now stores data in a local SQLite database file.
- The app creates the database and tables automatically when it starts.
- No external database server or MySQL setup is required.
