# 🚀 Start DIBEA Locally (Recommended)

## Why Local Instead of Docker?

The backend has TypeScript compilation errors that need to be fixed before Docker can build. Running locally is faster for development and avoids these build issues.

## ✅ Quick Start

### Step 1: Start Database Services Only
```bash
# Start only PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Verify they're running
docker-compose ps
```

### Step 2: Start Backend
```bash
# In one terminal
cd apps/backend
npm run dev
```

The backend will run on **http://localhost:3000**

### Step 3: Start Frontend
```bash
# In another terminal
cd apps/frontend
rm -rf .next node_modules/.cache
npm run dev
```

The frontend will run on **http://localhost:3001**

## 🌐 Access the Application

Open your browser to: **http://localhost:3001**

## 📊 Services Status

| Service | How It Runs | Port | URL |
|---------|-------------|------|-----|
| PostgreSQL | Docker | 5432 | `postgresql://dibea:dibea123@localhost:5432/dibea` |
| Redis | Docker | 6379 | `redis://localhost:6379` |
| Backend | Local (npm) | 3000 | http://localhost:3000 |
| Frontend | Local (npm) | 3001 | http://localhost:3001 |

## 🔍 Verify Everything is Running

```bash
# Check Docker services
docker-compose ps

# Check backend
curl http://localhost:3000/health

# Check frontend (in browser)
# Open http://localhost:3001
```

## 📝 Useful Commands

### Stop Everything
```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)

# Stop Docker services
docker-compose down
```

### Restart Services
```bash
# Restart backend
cd apps/backend
npm run dev

# Restart frontend
cd apps/frontend
npm run dev
```

### View Logs
```bash
# Backend logs - visible in the terminal where you ran npm run dev
# Frontend logs - visible in the terminal where you ran npm run dev

# Docker logs
docker-compose logs postgres
docker-compose logs redis
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Port 3001 already in use
```bash
lsof -ti:3001 | xargs kill -9
```

### Database connection error
```bash
# Make sure postgres is running
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres
```

### Frontend CSS errors
```bash
cd apps/frontend
rm -rf .next node_modules/.cache
npm run dev
```

## ✅ Advantages of Running Locally

1. **Faster Development** - No Docker build time
2. **Hot Reload** - Changes reflect immediately
3. **Better Debugging** - Direct access to logs
4. **No Build Errors** - Avoids TypeScript compilation issues in Docker
5. **Resource Efficient** - Uses less CPU/memory

## 🔄 Full Restart Script

Create a file `start-local.sh`:

```bash
#!/bin/bash

echo "🚀 Starting DIBEA Locally"
echo ""

# Start Docker services
echo "1️⃣  Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis
sleep 3

# Check Docker services
echo ""
echo "2️⃣  Docker Services Status:"
docker-compose ps

echo ""
echo "3️⃣  Starting Backend and Frontend..."
echo ""
echo "Run these commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd apps/backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd apps/frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3001"
```

Make it executable:
```bash
chmod +x start-local.sh
./start-local.sh
```

## 🎯 What to Test

After starting:

1. **Backend Health**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend Landing Page**
   - Open http://localhost:3001
   - Should see gradient background
   - No CSS errors

3. **Login**
   - Go to http://localhost:3001/auth/login
   - Try logging in

4. **API Connection**
   - Open browser DevTools (F12)
   - Network tab should show calls to `localhost:3000`

## 📚 Next Steps

Once everything is working locally, you can:

1. Fix the backend TypeScript errors
2. Update Docker configuration
3. Build Docker images
4. Deploy to production

But for now, running locally is the fastest way to get started!

---

**TL;DR**: 
```bash
# Terminal 1
docker-compose up -d postgres redis

# Terminal 2
cd apps/backend && npm run dev

# Terminal 3
cd apps/frontend && npm run dev

# Browser
# Open http://localhost:3001
```

