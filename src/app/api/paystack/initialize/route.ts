import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { email, amount, metadata } = await request.json();

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    const paymentPayload = {
      email,
      amount: amount * 100, // Convert to cents (Paystack uses cents for ZAR - R90 becomes 9000 cents)
      currency: 'ZAR',
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: 'Service',
            variable_name: 'service',
            value: 'Contract Analysis'
          }
        ]
      }
    };

    console.log('Payment payload:', paymentPayload);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();
    console.log('Paystack response:', data);

    if (!response.ok) {
      console.error('Paystack error:', data);
      return NextResponse.json(
        { 
          error: data.message || 'Failed to initialize payment',
          details: data,
          payload: paymentPayload
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data.data,
        amount: paymentPayload.amount // Ensure amount is included in response
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}