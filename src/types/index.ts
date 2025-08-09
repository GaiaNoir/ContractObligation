export interface Obligation {
  obligation: string;
  responsible_party: string;
  deadline: string;
  confidence?: number;
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