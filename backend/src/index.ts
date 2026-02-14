import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import logger from './utils/logger';
import { connectRedis } from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import pageRoutes from './routes/page.routes';
import blockRoutes from './routes/block.routes';
import databaseRoutes from './routes/database.routes';

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '4000', 10);

// Socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api', pageRoutes);
app.use('/api', blockRoutes);
app.use('/api', databaseRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-page', (pageId: string) => {
    socket.join(`page:${pageId}`);
    logger.debug(`Socket ${socket.id} joined page:${pageId}`);
  });

  socket.on('leave-page', (pageId: string) => {
    socket.leave(`page:${pageId}`);
  });

  socket.on('page-update', (data: { pageId: string; changes: unknown }) => {
    socket.to(`page:${data.pageId}`).emit('page-updated', data.changes);
  });

  socket.on('block-update', (data: { pageId: string; blockId: string; changes: unknown }) => {
    socket.to(`page:${data.pageId}`).emit('block-updated', {
      blockId: data.blockId,
      changes: data.changes,
    });
  });

  socket.on('disconnect', () => {
    logger.debug(`Client disconnected: ${socket.id}`);
  });
});

// Start server
async function start() {
  try {
    await connectRedis();
    httpServer.listen(PORT, () => {
      logger.info(`Votion API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, io };
