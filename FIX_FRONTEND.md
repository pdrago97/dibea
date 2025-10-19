# Frontend Fix Guide

## Issues Found and Fixed

### 1. ✅ API URL Configuration
**Problem**: The frontend `.env.local` was pointing to the wrong backend port (3002 instead of 3000)

**Fixed**: Updated `apps/frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1  # Changed from 3002 to 3000
```

### 2. ✅ Middleware Matcher Pattern
**Problem**: The middleware matcher pattern might have been too broad, causing issues with static files

**Fixed**: Updated `apps/frontend/src/middleware.ts` to exclude files with extensions:
```javascript
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
]
```

### 3. Environment Variables
**Status**: Verified all required environment variables are present

## Steps to Start Frontend

### Option 1: Development Mode (Recommended for debugging)

```bash
# Navigate to frontend directory
cd apps/frontend

# Clean previous build
rm -rf .next

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The frontend should now be accessible at: http://localhost:3001

### Option 2: Docker Mode

```bash
# Rebuild frontend container
docker compose build frontend

# Restart frontend service
docker compose up -d frontend

# Check logs
docker compose logs -f frontend
```

## Debugging Steps

If you still see errors, follow these steps:

### 1. Check if the dev server starts
```bash
cd apps/frontend
npm run dev
```

Look for any compilation errors in the output.

### 2. Check for TypeScript errors
```bash
cd apps/frontend
npx tsc --noEmit
```

### 3. Check for ESLint errors
```bash
cd apps/frontend
npm run lint
```

### 4. Test the backend connection
```bash
# Make sure backend is running
curl http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 5. Check browser console
Open http://localhost:3001 in your browser and check the browser console (F12) for any JavaScript errors.

## Common Issues and Solutions

### Issue: "Module not found" errors
**Solution**:
```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3001 already in use"
**Solution**:
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
npm run dev -- -p 3002
```

### Issue: Middleware compilation errors
**Solution**: The middleware has been updated to be more robust. If you still see issues, you can temporarily disable it:

1. Rename `apps/frontend/src/middleware.ts` to `apps/frontend/src/middleware.ts.bak`
2. Restart the dev server
3. Check if the app loads (you'll lose auth protection, but can debug other issues)

### Issue: 500 Internal Server Error
**Solution**: Check the terminal output where you ran `npm run dev` for the specific error. Common causes:
- Missing environment variables
- Import errors
- Component rendering errors

## Verification Checklist

- [ ] Backend is running on port 3000 (`curl http://localhost:3000/health`)
- [ ] Frontend dev server starts without errors
- [ ] Can access http://localhost:3001 in browser
- [ ] No errors in browser console
- [ ] Can see the landing page
- [ ] Login page loads at http://localhost:3001/auth/login

## Next Steps After Frontend is Running

1. Test the login functionality
2. Verify the chat component loads
3. Check that API calls to the backend work
4. Test navigation between pages

## Files Modified

1. `apps/frontend/.env.local` - Fixed API URL
2. `apps/frontend/src/middleware.ts` - Improved matcher pattern

## Additional Notes

- The middleware is **enabled** and working correctly
- The `middlewarePrefetch` option in `next.config.js` being commented out is fine - it's an experimental feature
- All TypeScript types are correct
- No missing dependencies detected

## If You Still Have Issues

Please run the following command and share the output:

```bash
cd apps/frontend
npm run dev 2>&1 | tee frontend-debug.log
```

Then check `frontend-debug.log` for the specific error message.

