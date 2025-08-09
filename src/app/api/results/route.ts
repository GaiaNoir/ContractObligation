import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '@/lib/paymentStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    console.log('Results API called with reference:', reference);

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    let paymentData = paymentStorage.get(reference);
    console.log('Direct lookup result:', paymentData ? 'found' : 'not found');

    // If not found with the provided reference, it might be a Paystack reference
    // Try to find the data by verifying the payment with Paystack to get the metadata
    if (!paymentData) {
      console.log('Attempting Paystack verification for reference:', reference);
      try {
        const verifyResponse = await fetch(`${request.nextUrl.origin}/api/paystack/verify?reference=${reference}`);
        console.log('Paystack verify response status:', verifyResponse.status);
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Paystack verify data:', JSON.stringify(verifyData, null, 2));
          
          if (verifyData.success && verifyData.data.status === 'success') {
            // Check if we have metadata with internal reference
            if (verifyData.data.metadata?.reference) {
              console.log('Found internal reference in metadata:', verifyData.data.metadata.reference);
              paymentData = paymentStorage.get(verifyData.data.metadata.reference);
              console.log('Internal reference lookup result:', paymentData ? 'found' : 'not found');
            } else {
              // If no metadata reference, this might be a test payment or old payment
              // Return a helpful error message
              console.log('Payment verified but no internal reference found in metadata');
              return NextResponse.json(
                { 
                  error: 'Payment verified but no associated data found. This may be a test payment or the data may have expired.',
                  paymentStatus: verifyData.data.status,
                  paymentAmount: verifyData.data.amount,
                  paymentDate: verifyData.data.paid_at
                },
                { status: 404 }
              );
            }
          } else {
            // Payment not successful
            console.log('Payment not successful:', verifyData.data.status);
            return NextResponse.json(
              { 
                error: `Payment status: ${verifyData.data.status}. Please complete payment to access results.`,
                paymentStatus: verifyData.data.status
              },
              { status: 403 }
            );
          }
        } else {
          // Paystack verification failed
          console.log('Paystack verification failed');
          return NextResponse.json(
            { error: 'Unable to verify payment. Please try again or contact support.' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Error verifying payment for results:', error);
        return NextResponse.json(
          { error: 'Error verifying payment. Please try again.' },
          { status: 500 }
        );
      }
    }

    if (!paymentData) {
      console.log('No payment data found after all attempts for reference:', reference);
      return NextResponse.json(
        { error: 'Results not found or expired. Data is only available for 1 hour after payment.' },
        { status: 404 }
      );
    }

    if (paymentData.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not verified' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error('Results retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}