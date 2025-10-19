# 🐳 Docker Compose Start Guide

## ✅ Issues Fixed

1. **`.env` file pointing to wrong compose file**
   - Changed: `COMPOSE_FILE=docker-compose.production.yml` → `docker-compose.yml`
   
2. **Wrong API URL in `.env`**
   - Changed: `NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1` → `http://localhost:3000/api/v1`

3. **PostCSS configuration for Tailwind CSS**
   - Updated `apps/frontend/postcss.config.js` to proper CommonJS format

4. **Middleware matcher pattern**
   - Updated `apps/frontend/src/middleware.ts` to exclude static files

## 🚀 Quick Start

### Option 1: Automated Script (Recommended)
```bash
./start-docker.sh
```

This will:
- ✅ Stop any running containers
- ✅ Build all services with latest changes
- ✅ Start all containers
- ✅ Wait for services to be healthy
- ✅ Show logs and status

### Option 2: Manual Commands
```bash
# Stop any running containers
docker-compose down

# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📊 Services

After starting, you'll have:

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `postgresql://dibea:dibea123@localhost:5432/dibea` |
| Redis | 6379 | `redis://localhost:6379` |
| Backend API | 3000 | http://localhost:3000 |
| Frontend | 3001 | http://localhost:3001 |

## 🌐 Access the Application

Open your browser to: **http://localhost:3001**

You should see:
- ✅ Landing page with blue/green gradient
- ✅ "O Futuro da Gestão Veterinária" heading
- ✅ Styled buttons and cards
- ✅ No CSS errors
- ✅ Floating chat button (bottom-right)

## 📝 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Restart all
docker-compose restart
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild specific service
docker-compose up --build -d frontend

# Rebuild all
docker-compose down
docker-compose up --build -d
```

## 🐛 Troubleshooting

### Frontend shows CSS errors
```bash
# Rebuild frontend with latest fixes
docker-compose up --build -d frontend

# Check logs
docker-compose logs frontend
```

### Backend not connecting to database
```bash
# Check postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart backend
docker-compose restart backend
```

### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use fuser
fuser -k 3001/tcp

# Then restart
docker-compose up -d frontend
```

### Complete reset
```bash
# Nuclear option - clean everything
docker-compose down -v
docker system prune -a
docker-compose up --build -d
```

## 🔍 Health Checks

### Check if services are healthy
```bash
# Backend health
curl http://localhost:3000/health

# Frontend (should return HTML)
curl http://localhost:3001

# PostgreSQL
docker-compose exec postgres pg_isready -U dibea -d dibea

# Redis
docker-compose exec redis redis-cli ping
```

## 📁 Files Modified

1. **`.env`**
   - Fixed `COMPOSE_FILE` to point to `docker-compose.yml`
   - Fixed `NEXT_PUBLIC_API_URL` to use port 3000

2. **`apps/frontend/postcss.config.js`**
   - Updated to proper CommonJS format for Next.js 14

3. **`apps/frontend/src/middleware.ts`**
   - Improved matcher pattern to exclude static files

4. **`start-docker.sh`**
   - Created automated startup script
   - Uses `docker-compose` (with hyphen)

## 🎯 What to Test

After starting:

1. **Landing Page** (http://localhost:3001)
   - [ ] Page loads without errors
   - [ ] Gradient background visible
   - [ ] Buttons are styled
   - [ ] No console errors (F12)

2. **Login** (http://localhost:3001/auth/login)
   - [ ] Login form displays
   - [ ] Can submit credentials
   - [ ] Redirects on success

3. **API Connection**
   - [ ] Open browser DevTools (F12)
   - [ ] Go to Network tab
   - [ ] Verify API calls go to `localhost:3000`

4. **Chat Functionality**
   - [ ] Floating chat button visible (bottom-right)
   - [ ] Can open chat
   - [ ] Can send messages

## 🔄 Development Workflow

### Making Changes

**Frontend changes:**
```bash
# Edit files in apps/frontend/
# Then rebuild
docker-compose up --build -d frontend
```

**Backend changes:**
```bash
# Edit files in apps/backend/
# Then rebuild
docker-compose up --build -d backend
```

**Database changes:**
```bash
# Edit migration files in supabase/migrations/
# Restart postgres to apply
docker-compose restart postgres
```

### Hot Reload (Development Mode)

For faster development, you can run services locally instead of in Docker:

```bash
# Stop Docker services
docker-compose down

# Keep only database services
docker-compose up -d postgres redis

# Run backend locally
cd apps/backend
npm run dev

# Run frontend locally (in another terminal)
cd apps/frontend
npm run dev
```

## 📚 Additional Resources

- **Full Fix Guide**: `FIX_FRONTEND.md`
- **CSS Error Details**: `FIX_CSS_ERROR.md`
- **Frontend Summary**: `FRONTEND_FIX_SUMMARY.md`
- **Quick Start**: `QUICK_START_FRONTEND.md`

## ✅ Success Checklist

- [ ] All containers running (`docker-compose ps`)
- [ ] Backend healthy (`curl http://localhost:3000/health`)
- [ ] Frontend accessible (`curl http://localhost:3001`)
- [ ] No CSS errors in browser console
- [ ] Can login successfully
- [ ] Chat button appears
- [ ] API calls work (check Network tab)

---

**TL;DR**: Run `./start-docker.sh` and open http://localhost:3001 🚀

