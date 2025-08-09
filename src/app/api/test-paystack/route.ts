import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    // Test with a simple transaction list request
    const response = await fetch('https://api.paystack.co/transaction', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Paystack credentials are working' : 'Paystack credentials failed',
      data: response.ok ? 'API connection successful' : data,
      keyPrefix: PAYSTACK_SECRET_KEY.substring(0, 12) + '...'
    });

  } catch (error) {
    console.error('Paystack test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Paystack connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}