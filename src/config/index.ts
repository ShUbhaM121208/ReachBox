import dotenv from 'dotenv';
import { EmailAccount } from '../types';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
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
  
  sync: {
    batchSize: 50,
    syncInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
  },
};

export const getEmailAccounts = (): EmailAccount[] => {
  const accountsString = process.env.EMAIL_ACCOUNTS || '';
  if (!accountsString) {
    return [];
  }
  
  return accountsString.split(',').map((account, index) => {
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