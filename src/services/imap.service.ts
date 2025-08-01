import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EventEmitter } from 'events';
import { EmailAccount, Email, EmailAttachment, IMAPConnection } from '../types';
import { config } from '../config';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class IMAPService extends EventEmitter {
  private connections: Map<string, IMAPConnection> = new Map();
  private accounts: EmailAccount[] = [];

  constructor() {
    super();
  }

  async initialize(accounts: EmailAccount[]): Promise<void> {
    this.accounts = accounts;
    logger.info(`Initializing IMAP service with ${accounts.length} accounts`);
    
    for (const account of accounts) {
      if (account.isActive) {
        await this.connectAccount(account);
      }
    }
  }

  private async connectAccount(account: EmailAccount): Promise<void> {
    try {
      const imap = new Imap({
        user: account.email,
        password: account.password,
        host: account.host,
        port: account.port,
        tls: account.tls,
        tlsOptions: { rejectUnauthorized: false },
        connTimeout: 60000,
        authTimeout: 5000,
      });

      const connection: IMAPConnection = {
        accountId: account.id,
        connection: imap,
        isConnected: false,
        lastActivity: new Date(),
      };

      imap.on('ready', () => {
        logger.info(`IMAP connected: ${account.email}`);
        connection.isConnected = true;
        connection.lastActivity = new Date();
        this.emit('connected', account.id);
        this.setupIdleMode(account, imap);
      });

      imap.on('mail', (numNewMsgs) => {
        logger.info(`New mail detected: ${numNewMsgs} messages in ${account.email}`);
        this.fetchNewEmails(account, imap);
      });

      imap.on('error', (err) => {
        logger.error(`IMAP error for ${account.email}:`, err);
        connection.isConnected = false;
        this.emit('error', { accountId: account.id, error: err });
        this.reconnectAccount(account);
      });

      imap.on('end', () => {
        logger.info(`IMAP connection ended: ${account.email}`);
        connection.isConnected = false;
        this.emit('disconnected', account.id);
      });

      this.connections.set(account.id, connection);
      imap.connect();
    } catch (error) {
      logger.error(`Failed to connect to IMAP for ${account.email}:`, error);
      throw error;
    }
  }

  private setupIdleMode(account: EmailAccount, imap: Imap): void {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        logger.error(`Failed to open INBOX for ${account.email}:`, err);
        return;
      }

      logger.info(`INBOX opened for ${account.email}, messages: ${box.messages.total}`);
      
      // Fetch last 30 days of emails
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      this.fetchEmailsByDate(account, imap, thirtyDaysAgo);
    });
  }

  private async fetchEmailsByDate(account: EmailAccount, imap: Imap, fromDate: Date): Promise<void> {
    const searchCriteria = ['SINCE', fromDate];
    
    imap.search(searchCriteria, (err, results) => {
      if (err) {
        logger.error(`Search failed for ${account.email}:`, err);
        return;
      }

      if (results.length === 0) {
        logger.info(`No emails found for ${account.email} since ${fromDate}`);
        return;
      }

      logger.info(`Found ${results.length} emails for ${account.email}`);
      this.fetchEmails(account, imap, results);
    });
  }

  private fetchNewEmails(account: EmailAccount, imap: Imap): void {
    imap.search(['UNSEEN'], (err, results) => {
      if (err) {
        logger.error(`Search for new emails failed for ${account.email}:`, err);
        return;
      }

      if (results.length > 0) {
        logger.info(`Found ${results.length} new emails for ${account.email}`);
        this.fetchEmails(account, imap, results);
      }
    });
  }

  private fetchEmails(account: EmailAccount, imap: Imap, uids: number[]): void {
    const fetch = imap.fetch(uids, {
      bodies: '',
      struct: true,
      envelope: true,
    });

    const emails: Email[] = [];

    fetch.on('message', (msg, seqno) => {
      const email: Partial<Email> = {
        id: uuidv4(),
        accountId: account.id,
        to: [],
        cc: [],
        bcc: [],
        attachments: [],
        flags: [],
        isRead: false,
        isStarred: false,
      };

      msg.on('body', (stream, info) => {
        simpleParser(stream, (err, parsed) => {
          if (err) {
            logger.error('Failed to parse email:', err);
            return;
          }

          if (parsed) {
            email.from = parsed.from?.text || '';
            email.to = parsed.to?.map(addr => addr.text) || [];
            email.cc = parsed.cc?.map(addr => addr.text) || [];
            email.bcc = parsed.bcc?.map(addr => addr.text) || [];
            email.subject = parsed.subject || '';
            email.text = parsed.text || '';
            email.html = parsed.html || '';
            email.date = parsed.date || new Date();
            email.threadId = parsed.messageId || undefined;

            if (parsed.attachments) {
              email.attachments = parsed.attachments.map(att => ({
                filename: att.filename || 'unknown',
                contentType: att.contentType || 'application/octet-stream',
                size: att.size || 0,
                content: att.content,
              }));
            }
          }
        });
      });

      msg.once('attributes', (attrs) => {
        email.uid = attrs.uid;
        email.flags = attrs.flags || [];
        email.isRead = attrs.flags?.includes('\\Seen') || false;
        email.isStarred = attrs.flags?.includes('\\Flagged') || false;
      });

      msg.once('end', () => {
        if (email.id && email.uid) {
          emails.push(email as Email);
        }
      });
    });

    fetch.once('error', (err) => {
      logger.error(`Fetch error for ${account.email}:`, err);
    });

    fetch.once('end', () => {
      logger.info(`Fetched ${emails.length} emails from ${account.email}`);
      this.emit('emails', { accountId: account.id, emails });
    });
  }

  private async reconnectAccount(account: EmailAccount): Promise<void> {
    const connection = this.connections.get(account.id);
    if (connection) {
      connection.connection.end();
      this.connections.delete(account.id);
    }

    // Wait before reconnecting
    setTimeout(async () => {
      try {
        await this.connectAccount(account);
      } catch (error) {
        logger.error(`Failed to reconnect to ${account.email}:`, error);
      }
    }, config.sync.retryDelay);
  }

  async disconnectAccount(accountId: string): Promise<void> {
    const connection = this.connections.get(accountId);
    if (connection) {
      connection.connection.end();
      this.connections.delete(accountId);
      logger.info(`Disconnected IMAP account: ${accountId}`);
    }
  }

  async disconnectAll(): Promise<void> {
    for (const [accountId, connection] of this.connections) {
      connection.connection.end();
    }
    this.connections.clear();
    logger.info('Disconnected all IMAP accounts');
  }

  getConnectionStatus(): { accountId: string; isConnected: boolean; lastActivity: Date }[] {
    return Array.from(this.connections.values()).map(conn => ({
      accountId: conn.accountId,
      isConnected: conn.isConnected,
      lastActivity: conn.lastActivity,
    }));
  }

  isAccountConnected(accountId: string): boolean {
    const connection = this.connections.get(accountId);
    return connection?.isConnected || false;
  }
}

export default new IMAPService(); 