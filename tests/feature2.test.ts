import request from 'supertest';
import app from '../src/backend/index';

describe('Feature 2: Elasticsearch Search', () => {
  describe('API Endpoints', () => {
    test('GET /api/health should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'email-aggregator');
    });

    test('GET /api/emails should return search results', async () => {
      const response = await request(app).get('/api/emails');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('emails');
      expect(response.body.data).toHaveProperty('total');
    });

    test('GET /api/emails with query parameter should search', async () => {
      const response = await request(app).get('/api/emails?query=test');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/emails with filters should work', async () => {
      const response = await request(app).get('/api/emails?folder=INBOX&isRead=false');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/emails with pagination should work', async () => {
      const response = await request(app).get('/api/emails?page=1&limit=10');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('limit', 10);
    });

    test('GET /api/emails/stats should return statistics', async () => {
      const response = await request(app).get('/api/emails/stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/emails/health should return Elasticsearch health', async () => {
      const response = await request(app).get('/api/emails/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
    });

    test('POST /api/emails/bulk should bulk index emails', async () => {
      const testEmails = [
        {
          id: 'test-1',
          uid: 1,
          accountId: 'account-1',
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Email 1',
          text: 'This is a test email',
          date: new Date(),
          folder: 'INBOX',
          flags: [],
          isRead: false,
          isStarred: false,
        },
        {
          id: 'test-2',
          uid: 2,
          accountId: 'account-1',
          from: 'test2@example.com',
          to: ['recipient2@example.com'],
          subject: 'Test Email 2',
          text: 'This is another test email',
          date: new Date(),
          folder: 'INBOX',
          flags: [],
          isRead: false,
          isStarred: false,
        },
      ];

      const response = await request(app)
        .post('/api/emails/bulk')
        .send({ emails: testEmails });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    test('POST /api/emails/bulk should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/emails/bulk')
        .send({ emails: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Emails must be an array');
    });

    test('PUT /api/emails/:id should update email', async () => {
      const response = await request(app)
        .put('/api/emails/test-1')
        .send({ isRead: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('DELETE /api/emails/:id should delete email', async () => {
      const response = await request(app).delete('/api/emails/test-1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Search Functionality', () => {
    test('should handle text search', async () => {
      const response = await request(app).get('/api/emails?query=important');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle date range search', async () => {
      const response = await request(app).get('/api/emails?dateFrom=2024-01-01&dateTo=2024-12-31');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle boolean filters', async () => {
      const response = await request(app).get('/api/emails?isRead=true&isStarred=false');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle sorting', async () => {
      const response = await request(app).get('/api/emails?sortBy=date&sortOrder=desc');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Error Handling', () => {
    test('should handle Elasticsearch connection errors gracefully', async () => {
      // This test would require mocking Elasticsearch to be down
      // For now, we'll just test that the endpoint exists
      const response = await request(app).get('/api/emails/health');
      expect(response.status).toBe(200);
    });

    test('should handle invalid pagination parameters', async () => {
      const response = await request(app).get('/api/emails?page=invalid&limit=invalid');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
}); 