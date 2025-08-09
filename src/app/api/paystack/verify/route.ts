import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to verify payment' },
        { status: response.status }
      );
    }

    // If payment is successful, update the stored results status
    if (data.data.status === 'success' && data.data.metadata?.reference) {
      console.log('Payment successful, updating status for reference:', data.data.metadata.reference);
      const { paymentStorage } = await import('@/lib/paymentStorage');
      paymentStorage.updateStatus(data.data.metadata.reference, 'success');
    } else {
      console.log('Payment not successful or no metadata reference:', {
        status: data.data.status,
        hasMetadata: !!data.data.metadata,
        metadataReference: data.data.metadata?.reference
      });
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}