import dotenv from 'dotenv';
import { EmailAccount } from '../types';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    index: 'emails',
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0,
    },
  },
  
  email: {
    imap: {
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: process.env.IMAP_TLS === 'true',
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },
  
  search: {
    maxResults: 100,
    defaultLimit: 20,
  },
};

export const getEmailAccounts = (): EmailAccount[] => {
  const accountsString = process.env.EMAIL_ACCOUNTS || '';
  if (!accountsString) {
    return [];
  }
  
  return accountsString.split(',').map((account: string, index: number) => {
    const [email, password] = account.split(':');
    return {
      id: `account-${index + 1}`,
      email: email.trim(),
      password: password.trim(),
      host: config.email.imap.host,
      port: config.email.imap.port,
      tls: config.email.imap.tls,
      isActive: true,
    };
  });
};

export default config; 