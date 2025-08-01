# Email Aggregator - ReachInbox Clone

A feature-rich email aggregator with AI-powered categorization and suggested replies, built for the Outbox Labs Backend Internship assignment.

## 🚀 Features

### ✅ Feature 1: Real-Time Email Synchronization
- Sync multiple IMAP accounts in real-time (minimum 2)
- Fetch last 30 days of emails
- Persistent IMAP connections with IDLE mode (no cron jobs)

### ✅ Feature 2: Searchable Storage using Elasticsearch
- Store emails in locally hosted Elasticsearch
- Implement indexing for searchable emails
- Support filtering by folder & account

### ✅ Feature 3: AI-Based Email Categorization
- Categorize emails into:
  - Interested
  - Meeting Booked
  - Not Interested
  - Spam
  - Out of Office

### ✅ Feature 4: Slack & Webhook Integration
- Send Slack notifications for "Interested" emails
- Trigger webhooks for external automation

### ✅ Feature 5: Frontend Interface
- Simple UI to display emails
- Filter by folder/account
- Show AI categorization
- Basic email search functionality

### ✅ Feature 6: AI-Powered Suggested Replies
- Store product and outreach agenda in vector database
- Use RAG with LLM to suggest replies
- Direct invitation to final interview

## 🏗️ Architecture

```
src/
├── backend/
│   ├── controllers/     # API endpoints
│   ├── middleware/      # Express middleware
│   ├── routes/          # Route definitions
│   └── index.ts         # Main server file
├── services/
│   ├── imap.service.ts      # Real-time email sync
│   ├── elasticsearch.service.ts  # Search & storage
│   ├── ai.service.ts        # AI categorization & replies
│   ├── slack.service.ts     # Slack notifications
│   ├── webhook.service.ts   # Webhook integration
│   └── vector.service.ts    # Vector database
├── config/
│   └── index.ts         # Configuration
├── types/
│   └── index.ts         # TypeScript types
└── utils/
    └── logger.ts        # Logging utility

frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── services/       # API calls
│   └── utils/          # Utilities
└── public/             # Static files
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Elasticsearch (search & storage)
- **Email**: IMAP with persistent connections
- **AI**: OpenAI GPT-4 for categorization & replies
- **Vector DB**: Local vector database for RAG
- **Notifications**: Slack API & Webhooks
- **Real-time**: Socket.IO

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Search**: Elasticsearch + Kibana
- **Caching**: Redis
- **Logging**: Winston

## 📋 Branch Strategy

```
main
├── feature/1-real-time-sync
├── feature/2-elasticsearch-search
├── feature/3-ai-categorization
├── feature/4-slack-webhooks
├── feature/5-frontend-ui
└── feature/6-ai-suggested-replies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

1. **Clone and setup**
```bash
git clone <your-repo>
cd reachinbox-clone
npm run setup
```

2. **Environment Configuration**
```bash
cp env.example .env
# Edit .env with your credentials
```

3. **Start Services**
```bash
npm run docker:up
npm run dev
```

4. **Access Applications**
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

## 📝 API Documentation

### Email Endpoints
- `GET /api/emails` - List emails with search/filters
- `GET /api/emails/:id` - Get specific email
- `PUT /api/emails/:id` - Update email (read/star)
- `GET /api/emails/stats` - Email statistics

### Sync Endpoints
- `GET /api/sync/status` - Sync status for all accounts
- `POST /api/sync/start` - Start sync for account
- `POST /api/sync/stop` - Stop sync for account

### AI Endpoints
- `POST /api/ai/categorize` - Categorize email
- `POST /api/ai/suggest-reply` - Get suggested reply

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific feature tests
npm test -- --grep "Feature 1"
```

## 📊 Monitoring

- **Logs**: Check `logs/` directory
- **Elasticsearch**: Kibana dashboard
- **Health**: `/api/health` endpoint

## 🔧 Development

### Feature Development Workflow

1. **Create feature branch**
```bash
git checkout -b feature/1-real-time-sync
```

2. **Develop feature**
```bash
# Make changes
npm run dev:backend
```

3. **Test feature**
```bash
npm test
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: implement real-time email sync"
git push origin feature/1-real-time-sync
```

5. **Create PR to main**
```bash
# Create Pull Request on GitHub
# Merge after review
```

### Environment Variables

Required environment variables (see `env.example`):
- `EMAIL_ACCOUNTS`: Comma-separated email:password pairs
- `OPENAI_API_KEY`: OpenAI API key
- `SLACK_BOT_TOKEN`: Slack bot token
- `WEBHOOK_URL`: Webhook URL for notifications

## 🎯 Assignment Progress

- [x] Feature 1: Real-Time Email Synchronization
- [x] Feature 2: Searchable Storage using Elasticsearch
- [x] Feature 3: AI-Based Email Categorization
- [x] Feature 4: Slack & Webhook Integration
- [x] Feature 5: Frontend Interface
- [x] Feature 6: AI-Powered Suggested Replies

## 📹 Demo Video

[Link to demo video will be added here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

[Your Name] - Backend Internship Candidate

---

**Note**: This project is built for the Outbox Labs Backend Internship assignment. All code is original and not plagiarized. 