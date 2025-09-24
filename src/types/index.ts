export interface Obligation {
  obligation: string;
  responsible_party: string;
  deadline: string;
  confidence?: number;
  contractSource?: {
    filename: string;       // Name of the contract file this obligation came from
    pageInfo?: string;      // Page information (e.g., "5 pages", "3 pages (2 processed)")
  };
  source?: {
    text: string;           // The exact sentence/paragraph from the original contract
    startIndex?: number;    // Character index where the source text starts
    endIndex?: number;      // Character index where the source text ends
    pageNumber?: number;    // Page number where this text appears (for PDFs)
    lineNumber?: number;    // Line number where this text appears (if available)
    matchScore?: number;    // Confidence score for fuzzy matching (1.0 = exact match)
  };
  risk?: {
    level: 'High' | 'Medium' | 'Low';  // Risk assessment level
    explanation: string;               // Explanation of why it was flagged at this level
  };
}

export interface ExtractedData {
  success: boolean;
  text: string;
  obligations: Obligation[];
  aiError?: string;
  pages: number;
  filename: string;
  processedPages?: number;
}

export interface PaymentData {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  obligations: Obligation[];
  extractedText: string;
  filename: string;
  pageInfo: string;
  timestamp: number;
}

export interface PaystackResponse {
  success: boolean;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    amount: number;
    metadata: any;
  };
}

export interface PaystackVerificationResponse {
  success: boolean;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}