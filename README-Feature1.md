# Feature 1: Real-Time Email Synchronization

## Overview
This feature implements real-time email synchronization using IMAP with persistent connections (IDLE mode) to fetch emails from multiple accounts without using cron jobs.

## Key Features
- ✅ Sync multiple IMAP accounts in real-time (minimum 2)
- ✅ Fetch last 30 days of emails
- ✅ Persistent IMAP connections with IDLE mode (no cron jobs)
- ✅ Real-time notifications via Socket.IO
- ✅ Automatic reconnection on connection loss
- ✅ Graceful error handling

## Architecture

### Components
1. **IMAPService** - Core service handling IMAP connections
2. **SyncController** - API endpoints for sync management
3. **Socket.IO** - Real-time communication
4. **Express Server** - REST API endpoints

### Flow
```
Email Account → IMAP Connection → Email Parsing → Event Emission → Socket.IO → Frontend
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Sync Status
```
GET /api/sync/status
```
Returns sync status for all configured email accounts.

### Connection Status
```
GET /api/sync/connections
```
Returns current connection status for all IMAP accounts.

### Start Sync
```
POST /api/sync/start/:accountId
```
Starts synchronization for a specific email account.

### Stop Sync
```
POST /api/sync/stop/:accountId
```
Stops synchronization for a specific email account.

## Socket.IO Events

### Client → Server
- `connection` - Client connects
- `disconnect` - Client disconnects

### Server → Client
- `account_connected` - Email account connected
- `account_disconnected` - Email account disconnected
- `new_emails` - New emails received
- `sync_error` - Sync error occurred

## Configuration

### Environment Variables
```bash
# Email Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true

# Email Accounts (comma-separated)
EMAIL_ACCOUNTS=account1@gmail.com:password1,account2@gmail.com:password2

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Usage

### Starting the Server
```bash
npm run dev
```

### Testing
```bash
npm test
```

### API Testing with Postman

1. **Health Check**
   ```
   GET http://localhost:3000/api/health
   ```

2. **Get Sync Status**
   ```
   GET http://localhost:3000/api/sync/status
   ```

3. **Start Sync for Account**
   ```
   POST http://localhost:3000/api/sync/start/account-1
   ```

4. **Stop Sync for Account**
   ```
   POST http://localhost:3000/api/sync/stop/account-1
   ```

## Implementation Details

### IMAP Connection Management
- Uses persistent connections with IDLE mode
- Automatic reconnection on connection loss
- Configurable retry delays and max retries
- Connection pooling for multiple accounts

### Email Parsing
- Parses email headers, body, and attachments
- Extracts metadata (flags, read status, etc.)
- Handles different email formats (text, HTML)
- Generates unique IDs for each email

### Real-time Features
- Socket.IO for real-time communication
- Event-driven architecture
- Automatic email fetching on new mail detection
- Live status updates

### Error Handling
- Graceful connection error handling
- Automatic reconnection with exponential backoff
- Detailed logging for debugging
- Error events for client notification

## Testing

### Unit Tests
- API endpoint testing
- IMAP service testing
- Configuration testing
- Error handling testing

### Integration Tests
- Full sync workflow testing
- Socket.IO event testing
- Connection management testing

## Performance Considerations

### Memory Management
- Efficient email parsing
- Connection pooling
- Garbage collection optimization

### Network Optimization
- Persistent connections reduce overhead
- Batch email processing
- Configurable sync intervals

### Scalability
- Support for multiple accounts
- Horizontal scaling ready
- Stateless API design

## Security

### Connection Security
- TLS encryption for IMAP connections
- Secure credential handling
- Input validation and sanitization

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting ready

## Monitoring

### Logging
- Structured logging with Winston
- Error tracking and reporting
- Performance metrics

### Health Checks
- Server health endpoint
- Connection status monitoring
- Email account status tracking

## Future Enhancements

### Planned Features
- Email filtering and rules
- Advanced search capabilities
- Email threading support
- Attachment handling improvements

### Performance Optimizations
- Email caching
- Incremental sync
- Background processing
- Database integration

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network connectivity
   - Verify IMAP credentials
   - Check firewall settings

2. **Authentication Errors**
   - Verify email/password
   - Check 2FA settings
   - Enable "Less secure app access" for Gmail

3. **No Emails Received**
   - Check account configuration
   - Verify IMAP is enabled
   - Check email account settings

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## Dependencies

### Core Dependencies
- `express` - Web framework
- `imap` - IMAP client
- `mailparser` - Email parsing
- `socket.io` - Real-time communication
- `winston` - Logging

### Development Dependencies
- `typescript` - TypeScript compiler
- `nodemon` - Development server
- `jest` - Testing framework
- `supertest` - API testing

## File Structure
```
src/
├── backend/
│   └── index.ts              # Main server file
├── services/
│   └── imap.service.ts       # IMAP service
├── controllers/
│   └── sync.controller.ts    # Sync API controller
├── routes/
│   └── sync.routes.ts        # Sync routes
├── config/
│   └── index.ts              # Configuration
├── types/
│   └── index.ts              # TypeScript types
└── utils/
    └── logger.ts             # Logging utility

tests/
└── feature1.test.ts          # Feature 1 tests
```

## Success Criteria

- [x] Multiple IMAP accounts supported
- [x] Real-time email synchronization
- [x] Last 30 days of emails fetched
- [x] Persistent IMAP connections (IDLE mode)
- [x] No cron jobs used
- [x] Real-time notifications
- [x] Error handling and recovery
- [x] API endpoints for management
- [x] Comprehensive testing
- [x] Documentation complete

## Next Steps

This feature is complete and ready for integration with:
- Feature 2: Elasticsearch storage
- Feature 3: AI categorization
- Feature 4: Slack/webhook integration
- Feature 5: Frontend interface
- Feature 6: AI suggested replies 