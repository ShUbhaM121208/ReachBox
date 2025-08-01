import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { Email, SearchFilters, SearchResult, PaginationParams } from '../types';
import logger from '../utils/logger';

export class ElasticsearchService {
  private client: Client;
  private index: string;

  constructor() {
    this.client = new Client({
      node: config.elasticsearch.url,
    });
    this.index = config.elasticsearch.index;
  }

  async initialize(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.createIndex();
        logger.info('Elasticsearch index created successfully');
      } else {
        logger.info('Elasticsearch index already exists');
      }
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch:', error);
      throw error;
    }
  }

  private async createIndex(): Promise<void> {
    const mapping = {
      mappings: {
        properties: {
          id: { type: 'keyword' },
          uid: { type: 'long' },
          accountId: { type: 'keyword' },
          from: { type: 'text', analyzer: 'standard' },
          to: { type: 'text', analyzer: 'standard' },
          cc: { type: 'text', analyzer: 'standard' },
          bcc: { type: 'text', analyzer: 'standard' },
          subject: { type: 'text', analyzer: 'standard' },
          text: { type: 'text', analyzer: 'standard' },
          html: { type: 'text', analyzer: 'standard' },
          date: { type: 'date' },
          folder: { type: 'keyword' },
          flags: { type: 'keyword' },
          threadId: { type: 'keyword' },
          isRead: { type: 'boolean' },
          isStarred: { type: 'boolean' },
          attachments: {
            type: 'nested',
            properties: {
              filename: { type: 'text' },
              contentType: { type: 'keyword' },
              size: { type: 'long' },
            },
          },
        },
      },
      settings: config.elasticsearch.settings,
    };

    await this.client.indices.create({
      index: this.index,
      body: mapping,
    });
  }

  async indexEmail(email: Email): Promise<void> {
    try {
      const emailDoc = {
        ...email,
        attachments: email.attachments?.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
        })),
      };

      await this.client.index({
        index: this.index,
        id: email.id,
        body: emailDoc,
      });

      logger.info(`Email indexed: ${email.id}`);
    } catch (error) {
      logger.error('Failed to index email:', error);
      throw error;
    }
  }

  async bulkIndexEmails(emails: Email[]): Promise<void> {
    if (emails.length === 0) return;

    try {
      const operations = emails.flatMap(email => [
        { index: { _index: this.index, _id: email.id } },
        {
          ...email,
          attachments: email.attachments?.map(att => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
          })),
        },
      ]);

      const result = await this.client.bulk({ body: operations });
      
      if (result.errors) {
        const errors = result.items
          .filter(item => item.index?.error)
          .map(item => item.index?.error);
        logger.error('Bulk indexing errors:', errors);
      }

      logger.info(`Bulk indexed ${emails.length} emails`);
    } catch (error) {
      logger.error('Failed to bulk index emails:', error);
      throw error;
    }
  }

  async searchEmails(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<SearchResult> {
    try {
      const query: any = {
        bool: {
          must: [],
          filter: [],
        },
      };

      // Text search
      if (filters.query) {
        query.bool.must.push({
          multi_match: {
            query: filters.query,
            fields: ['subject', 'text', 'from', 'to'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        });
      }

      // Filters
      if (filters.folder) {
        query.bool.filter.push({ term: { folder: filters.folder } });
      }

      if (filters.accountId) {
        query.bool.filter.push({ term: { accountId: filters.accountId } });
      }

      if (filters.isRead !== undefined) {
        query.bool.filter.push({ term: { isRead: filters.isRead } });
      }

      if (filters.isStarred !== undefined) {
        query.bool.filter.push({ term: { isStarred: filters.isStarred } });
      }

      // Date range
      if (filters.dateFrom || filters.dateTo) {
        const range: any = {};
        if (filters.dateFrom) range.gte = filters.dateFrom.toISOString();
        if (filters.dateTo) range.lte = filters.dateTo.toISOString();
        query.bool.filter.push({ range: { date: range } });
      }

      const sort = pagination.sortBy
        ? [{ [pagination.sortBy]: { order: pagination.sortOrder || 'desc' } }]
        : [{ date: { order: 'desc' } }];

      const response = await this.client.search({
        index: this.index,
        body: {
          query,
          sort,
          from: (pagination.page - 1) * pagination.limit,
          size: pagination.limit,
        },
      });

      const emails = response.hits.hits.map(hit => ({
        ...hit._source,
        id: hit._id,
      })) as Email[];

      return {
        emails,
        total: response.hits.total.value,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('Failed to search emails:', error);
      throw error;
    }
  }

  async updateEmail(id: string, updates: Partial<Email>): Promise<void> {
    try {
      await this.client.update({
        index: this.index,
        id,
        body: {
          doc: updates,
        },
      });

      logger.info(`Email updated: ${id}`);
    } catch (error) {
      logger.error('Failed to update email:', error);
      throw error;
    }
  }

  async deleteEmail(id: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.index,
        id,
      });

      logger.info(`Email deleted: ${id}`);
    } catch (error) {
      logger.error('Failed to delete email:', error);
      throw error;
    }
  }

  async getEmailStats(): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.index,
        body: {
          size: 0,
          aggs: {
            total_emails: { value_count: { field: 'id' } },
            by_account: {
              terms: { field: 'accountId' },
            },
            by_folder: {
              terms: { field: 'folder' },
            },
            date_histogram: {
              date_histogram: {
                field: 'date',
                calendar_interval: 'day',
              },
            },
          },
        },
      });

      return response.aggregations;
    } catch (error) {
      logger.error('Failed to get email stats:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Elasticsearch health check failed:', error);
      return false;
    }
  }
}

export default new ElasticsearchService(); 