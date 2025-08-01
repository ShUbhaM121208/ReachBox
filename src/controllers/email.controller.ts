import { Request, Response } from 'express';
import { APIResponse, SearchFilters, PaginationParams } from '../types';
import elasticsearchService from '../services/elasticsearch.service';
import logger from '../utils/logger';

export class EmailController {
  async searchEmails(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        folder,
        accountId,
        dateFrom,
        dateTo,
        isRead,
        isStarred,
        page = 1,
        limit = 20,
        sortBy,
        sortOrder = 'desc',
      } = req.query;

      const filters: SearchFilters = {
        query: query as string,
        folder: folder as string,
        accountId: accountId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        isStarred: isStarred !== undefined ? isStarred === 'true' : undefined,
      };

      const pagination: PaginationParams = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await elasticsearchService.searchEmails(filters, pagination);

      const response: APIResponse = {
        success: true,
        data: result,
        message: 'Emails searched successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to search emails:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to search emails',
      };
      res.status(500).json(response);
    }
  }

  async getEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // For now, we'll return a mock email since we haven't implemented get by ID
      // In a real implementation, you would fetch from Elasticsearch
      const response: APIResponse = {
        success: true,
        data: { id, message: 'Email details would be fetched from Elasticsearch' },
        message: 'Email retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get email:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to get email',
      };
      res.status(500).json(response);
    }
  }

  async updateEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      await elasticsearchService.updateEmail(id, updates);

      const response: APIResponse = {
        success: true,
        message: 'Email updated successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to update email:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to update email',
      };
      res.status(500).json(response);
    }
  }

  async deleteEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await elasticsearchService.deleteEmail(id);

      const response: APIResponse = {
        success: true,
        message: 'Email deleted successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to delete email:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to delete email',
      };
      res.status(500).json(response);
    }
  }

  async getEmailStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await elasticsearchService.getEmailStats();

      const response: APIResponse = {
        success: true,
        data: stats,
        message: 'Email statistics retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get email stats:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to get email statistics',
      };
      res.status(500).json(response);
    }
  }

  async bulkIndexEmails(req: Request, res: Response): Promise<void> {
    try {
      const { emails } = req.body;

      if (!Array.isArray(emails)) {
        const response: APIResponse = {
          success: false,
          error: 'Emails must be an array',
        };
        res.status(400).json(response);
        return;
      }

      await elasticsearchService.bulkIndexEmails(emails);

      const response: APIResponse = {
        success: true,
        message: `Bulk indexed ${emails.length} emails successfully`,
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to bulk index emails:', error);
      const response: APIResponse = {
        success: false,
        error: 'Failed to bulk index emails',
      };
      res.status(500).json(response);
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await elasticsearchService.healthCheck();

      const response: APIResponse = {
        success: isHealthy,
        data: { status: isHealthy ? 'healthy' : 'unhealthy' },
        message: isHealthy ? 'Elasticsearch is healthy' : 'Elasticsearch is unhealthy',
      };

      res.status(isHealthy ? 200 : 503).json(response);
    } catch (error) {
      logger.error('Health check failed:', error);
      const response: APIResponse = {
        success: false,
        error: 'Health check failed',
      };
      res.status(503).json(response);
    }
  }
}

export default new EmailController(); 