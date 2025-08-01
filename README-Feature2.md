# Feature 2: Searchable Storage using Elasticsearch

## Overview
This feature implements searchable email storage using Elasticsearch with advanced search capabilities, filtering, and analytics.

## Key Features
- ✅ Store emails in locally hosted Elasticsearch
- ✅ Implement indexing to make emails searchable
- ✅ Support filtering by folder & account
- ✅ Advanced text search with fuzzy matching
- ✅ Date range filtering
- ✅ Boolean filters (read/unread, starred)
- ✅ Pagination and sorting
- ✅ Bulk indexing operations
- ✅ Email statistics and analytics
- ✅ Health monitoring

## Architecture

### Components
1. **ElasticsearchService** - Core service for Elasticsearch operations
2. **EmailController** - API endpoints for email operations
3. **Elasticsearch** - Search engine and storage
4. **Kibana** - Analytics and monitoring dashboard

### Flow
```
Email Data → Elasticsearch Index → Search API → Filtered Results → Frontend
```

## API Endpoints

### Search Emails
```
GET /api/emails?query=search_term&folder=INBOX&accountId=account-1&dateFrom=2024-01-01&dateTo=2024-12-31&isRead=true&isStarred=false&page=1&limit=20&sortBy=date&sortOrder=desc
```
Returns searchable email results with filtering and pagination.

### Get Email
```
GET /api/emails/:id
```
Returns a specific email by ID.

### Update Email
```
PUT /api/emails/:id
Content-Type: application/json

{
  "isRead": true,
  "isStarred": false
}
```
Updates email properties.

### Delete Email
```
DELETE /api/emails/:id
```
Deletes an email from the index.

### Email Statistics
```
GET /api/emails/stats
```
Returns email analytics and statistics.

### Bulk Index Emails
```
POST /api/emails/bulk
Content-Type: application/json

{
  "emails": [
    {
      "id": "email-1",
      "uid": 1,
      "accountId": "account-1",
      "from": "sender@example.com",
      "to": ["recipient@example.com"],
      "subject": "Test Email",
      "text": "Email content",
      "date": "2024-01-01T00:00:00Z",
      "folder": "INBOX",
      "flags": [],
      "isRead": false,
      "isStarred": false
    }
  ]
}
```
Bulk indexes multiple emails.

### Health Check
```
GET /api/emails/health
```
Returns Elasticsearch health status.

## Search Features

### Text Search
- **Multi-field search**: Searches across subject, text, from, and to fields
- **Fuzzy matching**: Handles typos and variations
- **Best fields**: Prioritizes exact matches

### Filters
- **Folder filtering**: Filter by email folder (INBOX, SENT, etc.)
- **Account filtering**: Filter by email account
- **Date range**: Filter by date range
- **Boolean filters**: Filter by read/unread, starred status

### Pagination & Sorting
- **Page-based pagination**: Control result size and page
- **Sorting**: Sort by any field (date, subject, etc.)
- **Order control**: Ascending or descending order

## Configuration

### Environment Variables
```bash
# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Docker Setup
```bash
# Start Elasticsearch and Kibana
docker-compose up -d

# Check services
curl http://localhost:9200/_cluster/health
curl http://localhost:5601
```

## Usage

### Starting the Services
```bash
# Start Elasticsearch and Kibana
npm run docker:up

# Start the application
npm run dev
```

### Testing
```bash
npm test
```

### API Testing with Postman

1. **Search Emails**
   ```
   GET http://localhost:3000/api/emails?query=important&folder=INBOX&page=1&limit=10
   ```

2. **Bulk Index Emails**
   ```
   POST http://localhost:3000/api/emails/bulk
   Content-Type: application/json
   
   {
     "emails": [
       {
         "id": "test-1",
         "uid": 1,
         "accountId": "account-1",
         "from": "test@example.com",
         "to": ["recipient@example.com"],
         "subject": "Test Email",
         "text": "This is a test email",
         "date": "2024-01-01T00:00:00Z",
         "folder": "INBOX",
         "flags": [],
         "isRead": false,
         "isStarred": false
       }
     ]
   }
   ```

3. **Get Email Statistics**
   ```
   GET http://localhost:3000/api/emails/stats
   ```

4. **Health Check**
   ```
   GET http://localhost:3000/api/emails/health
   ```

## Implementation Details

### Elasticsearch Index Mapping
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "uid": { "type": "long" },
      "accountId": { "type": "keyword" },
      "from": { "type": "text", "analyzer": "standard" },
      "to": { "type": "text", "analyzer": "standard" },
      "subject": { "type": "text", "analyzer": "standard" },
      "text": { "type": "text", "analyzer": "standard" },
      "date": { "type": "date" },
      "folder": { "type": "keyword" },
      "isRead": { "type": "boolean" },
      "isStarred": { "type": "boolean" }
    }
  }
}
```

### Search Query Structure
```json
{
  "bool": {
    "must": [
      {
        "multi_match": {
          "query": "search_term",
          "fields": ["subject", "text", "from", "to"],
          "type": "best_fields",
          "fuzziness": "AUTO"
        }
      }
    ],
    "filter": [
      { "term": { "folder": "INBOX" } },
      { "term": { "accountId": "account-1" } },
      { "range": { "date": { "gte": "2024-01-01" } } }
    ]
  }
}
```

### Bulk Operations
- Efficient bulk indexing for multiple emails
- Error handling for failed operations
- Transaction-like behavior

## Performance Considerations

### Indexing Performance
- Bulk operations for multiple emails
- Optimized mapping for search performance
- Proper sharding and replication settings

### Search Performance
- Efficient query structure
- Proper use of filters vs queries
- Result caching capabilities

### Scalability
- Horizontal scaling with Elasticsearch cluster
- Index sharding for large datasets
- Read replicas for search performance

## Monitoring

### Kibana Dashboard
- Email volume over time
- Search query analytics
- Performance metrics
- Error monitoring

### Health Monitoring
- Elasticsearch cluster health
- Index performance metrics
- Search response times
- Error rate tracking

## Security

### Access Control
- Elasticsearch security settings
- API authentication ready
- Input validation and sanitization

### Data Protection
- Secure credential handling
- Data encryption at rest
- Audit logging

## Testing

### Unit Tests
- Service layer testing
- API endpoint testing
- Error handling testing
- Search functionality testing

### Integration Tests
- Elasticsearch integration
- Bulk operations testing
- Search performance testing

### Performance Tests
- Bulk indexing performance
- Search response times
- Concurrent user testing

## Troubleshooting

### Common Issues

1. **Elasticsearch Connection Failed**
   - Check if Elasticsearch is running
   - Verify ELASTICSEARCH_URL configuration
   - Check Docker container status

2. **Index Creation Failed**
   - Check Elasticsearch cluster health
   - Verify index mapping syntax
   - Check disk space

3. **Search Performance Issues**
   - Optimize query structure
   - Add proper filters
   - Consider index optimization

4. **Bulk Indexing Errors**
   - Check email data format
   - Verify required fields
   - Check Elasticsearch cluster health

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=elasticsearch npm run dev

# Check Elasticsearch logs
docker logs email-aggregator-elasticsearch
```

## Dependencies

### Core Dependencies
- `@elastic/elasticsearch` - Elasticsearch client
- `express` - Web framework
- `winston` - Logging

### Development Dependencies
- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `supertest` - API testing

## File Structure
```
src/
├── services/
│   └── elasticsearch.service.ts  # Elasticsearch service
├── controllers/
│   └── email.controller.ts       # Email API controller
├── routes/
│   └── email.routes.ts          # Email routes
├── config/
│   └── index.ts                 # Configuration
├── types/
│   └── index.ts                 # TypeScript types
└── utils/
    └── logger.ts                # Logging utility

tests/
└── feature2.test.ts             # Feature 2 tests

docker-compose.yml               # Elasticsearch & Kibana
```

## Success Criteria

- [x] Locally hosted Elasticsearch instance
- [x] Email indexing and storage
- [x] Advanced search functionality
- [x] Filtering by folder and account
- [x] Text search with fuzzy matching
- [x] Date range filtering
- [x] Boolean filters
- [x] Pagination and sorting
- [x] Bulk indexing operations
- [x] Email statistics
- [x] Health monitoring
- [x] Comprehensive testing
- [x] Documentation complete

## Next Steps

This feature is complete and ready for integration with:
- Feature 1: Real-time email sync (for data ingestion)
- Feature 3: AI categorization (for enhanced search)
- Feature 4: Slack/webhook integration
- Feature 5: Frontend interface
- Feature 6: AI suggested replies

## Kibana Dashboard

Access Kibana at http://localhost:5601 to:
- View email analytics
- Monitor search performance
- Create custom visualizations
- Set up alerts and monitoring 