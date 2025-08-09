// Simple in-memory storage for MVP - replace with database in production
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

  store(reference: string, data: Omit<PaymentData, 'reference' | 'timestamp'>) {
    const paymentData = {
      reference,
      ...data,
      timestamp: Date.now()
    };
    this.storage.set(reference, paymentData);
    console.log('Stored payment data with reference:', reference, 'Status:', data.status);
  }

  get(reference: string): PaymentData | null {
    console.log('Looking up reference:', reference);
    console.log('Available references:', Array.from(this.storage.keys()));
    
    const data = this.storage.get(reference);
    if (!data) {
      console.log('No data found for reference:', reference);
      return null;
    }

    // Clean up old entries (older than 1 hour)
    if (Date.now() - data.timestamp > 60 * 60 * 1000) {
      console.log('Data expired for reference:', reference);
      this.storage.delete(reference);
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
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.storage.entries()) {
      if (now - value.timestamp > 60 * 60 * 1000) {
        this.storage.delete(key);
      }
    }
  }
}

export const paymentStorage = new PaymentStorage();

// Clean up old entries every 10 minutes
setInterval(() => {
  paymentStorage.cleanup();
}, 10 * 60 * 1000);