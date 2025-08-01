export interface EmailAccount {
  id: string;
  email: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  isActive: boolean;
  lastSync?: Date;
}

export interface Email {
  id: string;
  uid: number;
  accountId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
  date: Date;
  folder: string;
  flags: string[];
  threadId?: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export interface SearchFilters {
  query?: string;
  folder?: string;
  accountId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isRead?: boolean;
  isStarred?: boolean;
}

export interface SearchResult {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IMAPConnection {
  accountId: string;
  connection: any;
  isConnected: boolean;
  lastActivity: Date;
}

export interface SyncStatus {
  accountId: string;
  isSyncing: boolean;
  lastSync: Date;
  totalEmails: number;
  newEmails: number;
  errors: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 