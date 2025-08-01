import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';
import elasticsearchService from '../services/elasticsearch.service';
import emailRoutes from '../routes/email.routes';
import logger from '../utils/logger';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/emails', emailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'email-aggregator',
    version: '1.0.0'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Initialize Elasticsearch service
async function initializeServices() {
  try {
    logger.info('Initializing Elasticsearch service...');
    await elasticsearchService.initialize();
    logger.info('Elasticsearch service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Elasticsearch service:', error);
  }
}

// Start server
const PORT = config.server.port;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.server.nodeEnv}`);
  
  // Initialize services after server starts
  initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app; 