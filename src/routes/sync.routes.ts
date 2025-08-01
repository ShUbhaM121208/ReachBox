import { Router } from 'express';
import syncController from '../controllers/sync.controller';

const router = Router();

// GET /api/sync/status - Get sync status for all accounts
router.get('/status', syncController.getSyncStatus);

// GET /api/sync/connections - Get connection status
router.get('/connections', syncController.getConnectionStatus);

// POST /api/sync/start/:accountId - Start sync for specific account
router.post('/start/:accountId', syncController.startSync);

// POST /api/sync/stop/:accountId - Stop sync for specific account
router.post('/stop/:accountId', syncController.stopSync);

export default router; 