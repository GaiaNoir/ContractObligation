import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '@/lib/paymentStorage';

export async function POST(request: NextRequest) {
  try {
    const { obligations, extractedText, filename, pageInfo } = await request.json();

    if (!obligations || !Array.isArray(obligations)) {
      return NextResponse.json(
        { error: 'Invalid obligations data' },
        { status: 400 }
      );
    }

    // Generate a unique reference
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Store the results temporarily
    paymentStorage.store(reference, {
      status: 'pending',
      obligations,
      extractedText: extractedText || '',
      filename: filename || 'unknown',
      pageInfo: pageInfo || ''
    });

    return NextResponse.json({
      success: true,
      reference
    });

  } catch (error) {
    console.error('Store results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}