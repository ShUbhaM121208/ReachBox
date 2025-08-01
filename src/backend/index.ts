import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config, getEmailAccounts } from '../config';
import imapService from '../services/imap.service';
import syncRoutes from '../routes/sync.routes';
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
app.use('/api/sync', syncRoutes);

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

// IMAP service event handlers
imapService.on('connected', (accountId: string) => {
  logger.info(`Account connected: ${accountId}`);
  io.emit('account_connected', { accountId });
});

imapService.on('disconnected', (accountId: string) => {
  logger.info(`Account disconnected: ${accountId}`);
  io.emit('account_disconnected', { accountId });
});

imapService.on('emails', ({ accountId, emails }) => {
  logger.info(`New emails received for account ${accountId}: ${emails.length}`);
  io.emit('new_emails', { accountId, emails });
});

imapService.on('error', ({ accountId, error }) => {
  logger.error(`IMAP error for account ${accountId}:`, error);
  io.emit('sync_error', { accountId, error: error.message });
});

// Initialize IMAP service with configured accounts
async function initializeServices() {
  try {
    const accounts = getEmailAccounts();
    if (accounts.length === 0) {
      logger.warn('No email accounts configured. Please set EMAIL_ACCOUNTS environment variable.');
      return;
    }

    logger.info(`Initializing IMAP service with ${accounts.length} accounts`);
    await imapService.initialize(accounts);
  } catch (error) {
    logger.error('Failed to initialize services:', error);
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
  await imapService.disconnectAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await imapService.disconnectAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app; 