# Docker Deployment Guide for DIBEA

This guide explains how to run the DIBEA application using Docker containers, which will help avoid WSL memory issues and provide a consistent development environment.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- 10GB of free disk space

### Development Environment

1. **Copy environment file:**

   ```bash
   cp .env.docker .env
   ```

2. **Start development containers:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **View logs:**

   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Stop containers:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Environment

1. **Copy and configure environment:**

   ```bash
   cp .env.docker .env
   # Edit .env with production values
   ```

2. **Start production containers:**

   ```bash
   docker-compose up -d
   ```

3. **With Nginx reverse proxy:**
   ```bash
   docker-compose --profile production up -d
   ```

## Available Services

### Development Stack

- **Frontend**: http://localhost:3001 (Next.js dev server)
- **Backend API**: http://localhost:3000 (Node.js with hot reload)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Production Stack

- **Frontend**: http://localhost:3001 (Next.js production)
- **Backend API**: http://localhost:3000 (Node.js production)
- **Nginx**: http://localhost:80 (Reverse proxy)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Environment Variables

Key environment variables in `.env.docker`:

```bash
# Database
POSTGRES_DB=dibea
POSTGRES_USER=dibea
POSTGRES_PASSWORD=dibea123

# Backend
DATABASE_URL=postgresql://dibea:dibea123@postgres:5432/dibea
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Development Specific

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access backend container for debugging
docker-compose -f docker-compose.dev.yml exec backend sh

# Access frontend container
docker-compose -f docker-compose.dev.yml exec frontend sh
```

### Database Operations

```bash
# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Access database directly
docker-compose exec postgres psql -U dibea -d dibea

# Seed database
docker-compose exec backend npx prisma db seed
```

### Volume Management

```bash
# List volumes
docker volume ls

# Remove volumes (WARNING: This deletes data)
docker-compose down -v

# Backup database
docker-compose exec postgres pg_dump -U dibea dibea > backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Make sure ports 3000, 3001, 5432, 6379 are available
   - Change ports in docker-compose.yml if needed

2. **Memory issues:**
   - Increase Docker memory allocation in Docker Desktop
   - Use `docker-compose down` to stop unused containers

3. **Database connection errors:**
   - Wait for PostgreSQL to be fully started
   - Check health status: `docker-compose ps`

4. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild: `docker-compose up --build`

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect dibea-backend | grep Health -A 10
```

### Debug Mode

For development, you can enable Node.js debugging:

```bash
# Backend will be available on port 9229 for debugging
docker-compose -f docker-compose.dev.yml exec backend npm run dev:debug
```

## Production Considerations

### Security

- Change default passwords in `.env`
- Use HTTPS with Nginx configuration
- Enable rate limiting (already configured)
- Set up proper CORS origins

### Performance

- Use production builds
- Enable Nginx reverse proxy
- Configure proper resource limits
- Set up monitoring and logging

### Backup Strategy

```bash
# Automated database backup
docker-compose exec postgres pg_dump -U dibea dibea | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip -c backup-20231201.sql.gz | docker-compose exec -T postgres psql -U dibea -d dibea
```

## File Structure

```
dibea/
├── docker-compose.yml          # Production stack
├── docker-compose.dev.yml      # Development stack
├── .env.docker                 # Environment template
├── nginx/
│   └── nginx.conf             # Nginx configuration
├── apps/
│   ├── backend/
│   │   ├── Dockerfile         # Production backend
│   │   └── Dockerfile.dev     # Development backend
│   └── frontend/
│       ├── Dockerfile         # Production frontend
│       └── Dockerfile.dev     # Development frontend
```

## Migration from WSL

To migrate from WSL development:

1. **Backup existing data:**

   ```bash
   # Export database from WSL
   pg_dump -h localhost -U dibea dibea > wsl-backup.sql
   ```

2. **Start Docker containers:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Import data:**

   ```bash
   cat wsl-backup.sql | docker-compose exec -T postgres psql -U dibea -d dibea
   ```

4. **Update local environment:**
   - Point your API calls to `http://localhost:3000`
   - Access frontend at `http://localhost:3001`

## Support

For issues:

1. Check container logs: `docker-compose logs`
2. Verify service health: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review this documentation and update as needed
