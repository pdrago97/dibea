import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import animalRoutes from './routes/animals';
// import documentRoutes from './routes/documents'; // Temporarily disabled due to TypeScript errors
import tutorRoutes from './routes/tutors';
import adoptionRoutes from './routes/adoptions';
import complaintRoutes from './routes/complaints';
import campaignRoutes from './routes/campaigns';
import dashboardRoutes from './routes/dashboard';
import notificationRoutes from './routes/notifications';
import landingRoutes from './routes/landing'; // Landing page routes
// import taskRoutes from './routes/tasks'; // Temporarily disabled due to TypeScript errors
import n8nRoutes from './routes/n8n'; // N8N internal routes
import adminRoutes from './routes/admin'; // Admin routes
import analyticsRoutes from './routes/analytics'; // Analytics routes
// import { agentRoutes } from './routes/agentRoutes'; // Temporarily disabled due to TypeScript errors

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import services
import { graphService } from './services/graphService';
import { documentAnalysisService } from './services/documentAnalysisService';
import { storageService } from './services/storageService';
import { authLimiter, apiLimiter } from './middleware/rateLimiting';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - necessário para Cloudflare Tunnel e outros proxies reversos
app.set('trust proxy', true);

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://dibea.com.br', 'https://www.dibea.com.br']
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        /\.trycloudflare\.com$/, // Aceitar qualquer URL do Cloudflare Tunnel
        /\.ngrok\.io$/, // Aceitar qualquer URL do ngrok
        /\.loca\.lt$/ // Aceitar qualquer URL do localtunnel
      ],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(apiLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/animals', animalRoutes);
// app.use('/api/v1/documents', documentRoutes); // Temporarily disabled
app.use('/api/v1/tutors', tutorRoutes);
app.use('/api/v1/adoptions', adoptionRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/landing', landingRoutes);
// app.use('/api/v1/tasks', taskRoutes); // Temporarily disabled
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
// app.use('/api/v1/agents', agentRoutes); // Temporarily disabled

// N8N Internal Routes (API Key authentication)
app.use('/api/v1/n8n', n8nRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  // await redis.disconnect(); // Optional - not critical
  // await graphService.disconnect(); // Optional - not critical
  await documentAnalysisService.terminate();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  // await redis.disconnect(); // Optional - not critical
  // await graphService.disconnect(); // Optional - not critical
  await documentAnalysisService.terminate();
  process.exit(0);
});

// Initialize services
async function initializeServices() {
  try {
    // await graphService.connect(); // Temporarily disabled - Neo4j not configured
    await documentAnalysisService.initialize();
    await storageService.initialize();
    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 DIBEA Backend API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);

  // Initialize services after server starts
  await initializeServices();
});

export default app;
