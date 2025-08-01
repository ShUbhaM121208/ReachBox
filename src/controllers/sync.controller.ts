import { Request, Response } from 'express';
import { APIResponse, SyncStatus } from '../types';
import imapService from '../services/imap.service';
import { getEmailAccounts } from '../config';
import logger from '../utils/logger';

export class SyncController {
  async getSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const accounts = getEmailAccounts();
      const status: SyncStatus[] = accounts.map(account => ({
        accountId: account.id,
        isSyncing: imapService.isAccountConnected(account.id),
        lastSync: new Date(),
        totalEmails: 0,
        newEmails: 0,
        errors: [],
      }));

      const response: APIResponse<SyncStatus[]> = {
        success: true,
        data: status,
        message: 'Sync status retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get sync status:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to get sync status',
      };
      res.status(500).json(response);
    }
  }

  async startSync(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const accounts = getEmailAccounts();
      const account = accounts.find(acc => acc.id === accountId);

      if (!account) {
        const response: APIResponse = {
          success: false,
          error: 'Account not found',
        };
        res.status(404).json(response);
        return;
      }

      await imapService.initialize([account]);

      const response: APIResponse = {
        success: true,
        message: `Sync started for account: ${account.email}`,
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to start sync:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to start sync',
      };
      res.status(500).json(response);
    }
  }

  async stopSync(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;

      await imapService.disconnectAccount(accountId);

      const response: APIResponse = {
        success: true,
        message: `Sync stopped for account: ${accountId}`,
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to stop sync:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to stop sync',
      };
      res.status(500).json(response);
    }
  }

  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = imapService.getConnectionStatus();

      const response: APIResponse = {
        success: true,
        data: status,
        message: 'Connection status retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get connection status:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to get connection status',
      };
      res.status(500).json(response);
    }
  }
}

export default new SyncController(); 