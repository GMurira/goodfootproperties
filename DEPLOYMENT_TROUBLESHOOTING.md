# Deployment Troubleshooting Guide

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
