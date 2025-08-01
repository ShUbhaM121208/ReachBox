import request from 'supertest';
import app from '../src/backend/index';
import { getEmailAccounts } from '../src/config';

describe('Feature 1: Real-Time Email Synchronization', () => {
  describe('API Endpoints', () => {
    test('GET /api/health should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'email-aggregator');
    });

    test('GET /api/sync/status should return sync status', async () => {
      const response = await request(app).get('/api/sync/status');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/sync/connections should return connection status', async () => {
      const response = await request(app).get('/api/sync/connections');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/sync/start/:accountId should start sync for account', async () => {
      const accounts = getEmailAccounts();
      if (accounts.length > 0) {
        const accountId = accounts[0].id;
        const response = await request(app).post(`/api/sync/start/${accountId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('POST /api/sync/stop/:accountId should stop sync for account', async () => {
      const accounts = getEmailAccounts();
      if (accounts.length > 0) {
        const accountId = accounts[0].id;
        const response = await request(app).post(`/api/sync/stop/${accountId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('POST /api/sync/start/:accountId should return 404 for non-existent account', async () => {
      const response = await request(app).post('/api/sync/start/non-existent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Account not found');
    });
  });

  describe('Configuration', () => {
    test('should load email accounts from environment', () => {
      const accounts = getEmailAccounts();
      expect(Array.isArray(accounts)).toBe(true);
    });

    test('should have proper IMAP configuration', () => {
      const { config } = require('../src/config');
      expect(config.email.imap).toHaveProperty('host');
      expect(config.email.imap).toHaveProperty('port');
      expect(config.email.imap).toHaveProperty('tls');
    });
  });

  describe('IMAP Service', () => {
    test('should initialize with accounts', async () => {
      const accounts = getEmailAccounts();
      if (accounts.length > 0) {
        const { IMAPService } = require('../src/services/imap.service');
        const imapService = new IMAPService();
        await expect(imapService.initialize(accounts)).resolves.not.toThrow();
      }
    });

    test('should handle connection status', () => {
      const { IMAPService } = require('../src/services/imap.service');
      const imapService = new IMAPService();
      const status = imapService.getConnectionStatus();
      expect(Array.isArray(status)).toBe(true);
    });
  });
}); 