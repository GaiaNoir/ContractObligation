import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '@/lib/paymentStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    console.log('Debug: Looking up reference:', reference);

    // First try direct lookup
    const directLookup = paymentStorage.get(reference);
    console.log('Debug: Direct lookup result:', directLookup ? 'found' : 'not found');

    // Try Paystack verification to get metadata
    let paystackData = null;
    try {
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/paystack/verify?reference=${reference}`);
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        paystackData = verifyData.data;
        console.log('Debug: Paystack data:', JSON.stringify(paystackData, null, 2));
      }
    } catch (error) {
      console.log('Debug: Paystack verification failed:', error);
    }

    // Try lookup with internal reference from metadata
    let metadataLookup = null;
    if (paystackData?.metadata?.reference) {
      metadataLookup = paymentStorage.get(paystackData.metadata.reference);
      console.log('Debug: Metadata reference lookup result:', metadataLookup ? 'found' : 'not found');
    }

    return NextResponse.json({
      debug: true,
      searchReference: reference,
      directLookup: directLookup ? 'found' : 'not found',
      paystackVerification: paystackData ? 'success' : 'failed',
      paystackStatus: paystackData?.status,
      metadataReference: paystackData?.metadata?.reference,
      metadataLookup: metadataLookup ? 'found' : 'not found',
      paystackData: paystackData,
      directData: directLookup,
      metadataData: metadataLookup
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}