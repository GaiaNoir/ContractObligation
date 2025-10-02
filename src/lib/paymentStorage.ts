import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Simple file-based storage for development - replace with database in production
interface PaymentData {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  obligations: any[];
  extractedText: string;
  filename: string;
  pageInfo: string;
  timestamp: number;
}

class PaymentStorage {
  private storage: Map<string, PaymentData> = new Map();
  private storageDir: string;

  constructor() {
    // Use a persistent directory for storage
    this.storageDir = join(tmpdir(), 'contract-extractor-storage');
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
    this.loadFromDisk();
  }

  private getFilePath(reference: string): string {
    return join(this.storageDir, `${reference}.json`);
  }

  private loadFromDisk() {
    try {
      // Load all existing files from disk
      const fs = require('fs');
      if (existsSync(this.storageDir)) {
        const files = fs.readdirSync(this.storageDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const filePath = join(this.storageDir, file);
              const data = JSON.parse(readFileSync(filePath, 'utf8'));
              this.storage.set(data.reference, data);
            } catch (error) {
              console.warn('Failed to load payment data file:', file, error);
            }
          }
        }
      }
      console.log('Loaded', this.storage.size, 'payment records from disk');
    } catch (error) {
      console.warn('Failed to load payment data from disk:', error);
    }
  }

  private saveToDisk(reference: string, data: PaymentData) {
    try {
      const filePath = this.getFilePath(reference);
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save payment data to disk:', error);
    }
  }

  private deleteFromDisk(reference: string) {
    try {
      const filePath = this.getFilePath(reference);
      if (existsSync(filePath)) {
        const fs = require('fs');
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Failed to delete payment data from disk:', error);
    }
  }

  store(reference: string, data: Omit<PaymentData, 'reference' | 'timestamp'>) {
    const paymentData = {
      reference,
      ...data,
      timestamp: Date.now()
    };
    this.storage.set(reference, paymentData);
    this.saveToDisk(reference, paymentData);
    console.log('Stored payment data with reference:', reference, 'Status:', data.status);
  }

  get(reference: string): PaymentData | null {
    console.log('Looking up reference:', reference);
    console.log('Available references:', Array.from(this.storage.keys()));
    
    let data = this.storage.get(reference);
    
    // If not in memory, try to load from disk
    if (!data) {
      try {
        const filePath = this.getFilePath(reference);
        if (existsSync(filePath)) {
          data = JSON.parse(readFileSync(filePath, 'utf8'));
          if (data) {
            this.storage.set(reference, data);
            console.log('Loaded data from disk for reference:', reference);
          }
        }
      } catch (error) {
        console.warn('Failed to load data from disk for reference:', reference, error);
      }
    }
    
    if (!data) {
      console.log('No data found for reference:', reference);
      return null;
    }

    // Clean up old entries (older than 1 hour)
    if (Date.now() - data.timestamp > 60 * 60 * 1000) {
      console.log('Data expired for reference:', reference);
      this.storage.delete(reference);
      this.deleteFromDisk(reference);
      return null;
    }

    console.log('Found data for reference:', reference, 'Status:', data.status);
    return data;
  }

  updateStatus(reference: string, status: 'pending' | 'success' | 'failed') {
    const data = this.storage.get(reference);
    if (data) {
      data.status = status;
      this.storage.set(reference, data);
      this.saveToDisk(reference, data);
      console.log('Updated status for reference:', reference, 'to:', status);
    } else {
      console.warn('Attempted to update status for non-existent reference:', reference);
    }
  }

  cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, value] of this.storage.entries()) {
      if (now - value.timestamp > 60 * 60 * 1000) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.storage.delete(key);
      this.deleteFromDisk(key);
    }
    
    if (expiredKeys.length > 0) {
      console.log('Cleaned up', expiredKeys.length, 'expired payment records');
    }
  }

  // Debug method to list all references
  getAllReferences(): string[] {
    return Array.from(this.storage.keys());
  }
}

export const paymentStorage = new PaymentStorage();

// Clean up old entries every 10 minutes
setInterval(() => {
  paymentStorage.cleanup();
}, 10 * 60 * 1000);