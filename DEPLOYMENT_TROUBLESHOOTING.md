# Deployment Troubleshooting Guide

## Common Server Startup Issues

### 1. Check if server is actually running
```bash
# Check for running processes
ps aux | grep "node.*server.js"

# Test server health
curl http://localhost:3000/api/health
```

### 2. Port Already in Use Error
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Kill processes using port 3000
npx kill-port 3000
# OR
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### 3. Module Not Found Errors
```bash
Error: Cannot find module 'express'
```
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. Database Permission Issues
```bash
Error: SQLITE_CANTOPEN: unable to open database file
```
**Solution:**
```bash
# Create database directory with proper permissions
mkdir -p database
chmod 755 database/

# Check if database file exists
ls -la database/properties.db
```

### 5. Environment Variables Missing
```bash
Error: Missing required environment variables
```
**Solution:**
```bash
# Create .env file from template
cp .env.example .env

# Edit .env file with proper values
nano .env
```

### 6. Upload Directory Issues
```bash
Error: ENOENT: no such file or directory, open 'backend/uploads/...'
```
**Solution:**
```bash
# Create upload directories
mkdir -p backend/uploads/lands
mkdir -p backend/uploads/cars
mkdir -p backend/uploads/apartments
chmod 755 backend/uploads/
```

### 7. Node.js Version Issues
```bash
Error: Unsupported Node.js version
```
**Solution:**
```bash
# Check Node.js version (should be 14+)
node --version

# Update Node.js if needed
# Using nvm (recommended)
nvm install 18
nvm use 18
```

### 8. JWT Secret Error
```bash
Error: JWT_SECRET is required
```
**Solution:**
```bash
# Add to .env file
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

## Quick Diagnostic Commands

### Check Everything is Set Up
```bash
# 1. Check if .env exists
ls -la .env

# 2. Check if dependencies are installed
npm list --depth=0

# 3. Check if directories exist
ls -la backend/uploads/
ls -la database/

# 4. Test server startup
NODE_ENV=development node backend/server.js
```

### Check Server Health
```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/properties
curl http://localhost:3000/
```

## Reset Everything (Nuclear Option)
```bash
# Stop all processes
pkill -f "node.*server.js"

# Clean install
rm -rf node_modules package-lock.json
npm install

# Recreate directories
mkdir -p database
mkdir -p backend/uploads/{lands,cars,apartments}

# Reset environment
cp .env.example .env

# Start fresh
npm run dev
```

## Development vs Production Issues

### Development Mode
```bash
# Start with detailed logging
NODE_ENV=development node backend/server.js
```

### Production Mode
```bash
# Start in production mode
NODE_ENV=production node backend/server.js
```

## Still Having Issues?

1. **Check the exact error message** - Copy the full error output
2. **Verify file permissions** - Make sure all directories are readable/writable
3. **Check network connectivity** - Ensure port 3000 is not blocked
4. **Review environment variables** - Make sure .env file is properly configured
5. **Test with minimal setup** - Try running just the server without any custom modifications

## Getting Help

If server still fails to start, provide:
- Exact error message
- Output of `node --version`
- Output of `npm --version`
- Contents of .env file (without sensitive data)
- Output of `npm list --depth=0`

## Common Issues and Solutions

### 1. App keeps loading / Properties not loading on frontend

**Symptoms:**
- Frontend shows loading spinner indefinitely
- Properties section remains empty
- Admin dashboard won't open

**Possible Causes & Solutions:**

#### A. Environment Variables Missing
- Ensure these are set in your Render environment:
  - `NODE_ENV=production`
  - `PORT` (usually auto-set by Render)
  - `DATABASE_URL` (if using external database)
  - `JWT_SECRET` (for admin authentication)

#### B. Database Not Initialized
- Check if database tables exist
- Run database initialization if needed
- Verify SQLite database file is created

#### C. API Endpoints Not Responding
- Check Render logs for API errors
- Verify `/api/health` endpoint is accessible
- Test API endpoints in browser or Postman

#### D. CORS Issues
- Ensure `FRONTEND_URL` environment variable is set correctly
- For Render deployments, set to your render app URL

### 2. Dashboard Stats Showing Zero

**Fixed Issues:**
- ✅ Properties count: Backend now returns `totalProperties` instead of `total`
- ✅ Messages count: Backend now returns `totalMessages` instead of `total`

### 3. Debugging Steps for Render Deployment

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your service
   - Check "Logs" tab for errors

2. **Test API Health:**
   - Visit `https://your-app-url.onrender.com/api/health`
   - Should return JSON with success status

3. **Check Database:**
   - Ensure SQLite database is being created
   - Check if tables exist and have data

4. **Environment Variables:**
   - Verify all required env vars are set in Render
   - Check spelling and values

### 4. Performance Optimization for Render

- Database operations might be slower on Render
- Consider adding loading states
- Implement proper error handling
- Use connection pooling if needed

### 5. Quick Fix Commands

```bash
# Test API locally
curl http://localhost:3000/api/health

# Check database
sqlite3 database/properties.db ".tables"

# Test production API
curl https://your-app-url.onrender.com/api/health
```

## Contact Support

If issues persist, check:
1. Render service logs
2. Database connection status
3. Environment variable configuration
4. API endpoint accessibility
