import { Router } from 'express';
import emailController from '../controllers/email.controller';

const router = Router();

// GET /api/emails - Search emails with filters
router.get('/', emailController.searchEmails);

// GET /api/emails/:id - Get specific email
router.get('/:id', emailController.getEmail);

// PUT /api/emails/:id - Update email
router.put('/:id', emailController.updateEmail);

// DELETE /api/emails/:id - Delete email
router.delete('/:id', emailController.deleteEmail);

// GET /api/emails/stats - Get email statistics
router.get('/stats', emailController.getEmailStats);

// POST /api/emails/bulk - Bulk index emails
router.post('/bulk', emailController.bulkIndexEmails);

// GET /api/emails/health - Elasticsearch health check
router.get('/health', emailController.healthCheck);

export default router; 