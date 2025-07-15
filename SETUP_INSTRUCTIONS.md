# Good Foot Properties - Setup Instructions

## For Your Colleague to Set Up the Project

### Prerequisites
Make sure you have the following installed:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone and Switch to the Feature Branch

```bash
# If cloning fresh (recommended)
git clone https://github.com/GMurira/goodfootproperties.git
cd goodfootproperties

# Switch to the feature branch with all the new backend work
git checkout feature/backend-property-system

# OR if already have the repo cloned:
cd goodfootproperties
git fetch origin
git checkout feature/backend-property-system
git pull origin feature/backend-property-system
```

### Step 2: Install Dependencies

```bash
# Install all required npm packages
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **sqlite3** - Database
- **multer** - File uploads
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication
- **nodemon** - Development auto-restart

### Step 3: Environment Setup

Create a `.env` file in the root directory:

```bash
# Create environment file
touch .env
```

Add the following content to `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
FRONTEND_URL=http://localhost:3000

# Database (SQLite file will be created automatically)
DB_PATH=./database/properties.db

# Admin credentials (will be created automatically)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 4: Create Required Directories

```bash
# Create database directory
mkdir -p database

# Create upload directories (if not already created)
mkdir -p backend/uploads/lands
mkdir -p backend/uploads/cars  
mkdir -p backend/uploads/apartments
```

### Step 5: Start the Development Server

```bash
# Start in development mode (auto-restarts on file changes)
npm run dev

# OR start in production mode
npm start
```

You should see:
```
🚀 Good Foot Properties API Server Started!
📍 Server running on: http://localhost:3000
🌐 Environment: development
📡 API Documentation: http://localhost:3000/api
🏠 Frontend: http://localhost:3000
📧 Contact: http://localhost:3000/contact
🔐 Admin: http://localhost:3000/admin

Connected to SQLite database
Properties table ready
Admin users table ready  
Contact messages table ready
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Contact Page**: http://localhost:3000/contact
- **API Documentation**: http://localhost:3000/api

### Default Admin Login
- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the admin password immediately after first login!

## Project Structure

```
goodfootproperties/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication middleware  
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   ├── uploads/        # Uploaded images
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── public/
│   ├── admin/          # Admin dashboard
│   ├── assets/         # Images and static files
│   ├── css/           # Stylesheets
│   ├── js/            # Frontend JavaScript
│   ├── index.html     # Main homepage
│   └── contact.html   # Contact page
├── database/           # SQLite database files
├── package.json        # Dependencies and scripts
└── .env               # Environment variables
```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/category/:category` - Get by category (lands/cars/apartments)
- `POST /api/properties` - Add property (admin only)
- `PUT /api/properties/:id` - Update property (admin only)
- `DELETE /api/properties/:id` - Delete property (admin only)

### Contact
- `POST /api/contact/submit` - Submit contact message
- `GET /api/contact` - Get all messages (admin only)

### Authentication  
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

## Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill any process using port 3000
   npx kill-port 3000
   # Or change PORT in .env file
   ```

2. **Database permission issues**:
   ```bash
   # Make sure database directory exists and is writable
   chmod 755 database/
   ```

3. **Module not found errors**:
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Images not loading**:
   - Check that upload directories exist
   - Verify file permissions on backend/uploads/

## For Production Deployment

1. Set `NODE_ENV=production` in .env
2. Change JWT_SECRET to a strong random string
3. Update admin credentials
4. Set proper CORS origins
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "goodfoot-api"
   ```

## Need Help?

If you encounter any issues:
1. Check the server logs in the terminal
2. Verify all dependencies are installed with `npm list`
3. Ensure the `.env` file is properly configured
4. Check that all required directories exist

The database and admin user will be created automatically on first run.
