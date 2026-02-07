import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { startJobs } from '@/jobs';
import { errorHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';

// Routes
import authRoutes from '@/routes/auth';
import productRoutes from '@/routes/products';
import searchRoutes from '@/routes/search';
import favoriteRoutes from '@/routes/favorites';
import alertRoutes from '@/routes/alerts';
import comparisonRoutes from '@/routes/comparison';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limite de 100 requisições
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas autenticadas
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/search', authMiddleware, searchRoutes);
app.use('/api/favorites', authMiddleware, favoriteRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/comparison', authMiddleware, comparisonRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handling
app.use(errorHandler);

// Inicialização
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDatabase();
    logger.info('Database connected successfully');

    // Iniciar jobs agendados
    startJobs();
    logger.info('Scheduled jobs started');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;
