import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '@/lib/paymentStorage';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    // Get all stored references (without exposing sensitive data)
    const storage = (paymentStorage as any).storage as Map<string, any>;
    const references = Array.from(storage.keys());
    const summaries = references.map(ref => {
      const data = storage.get(ref);
      return {
        reference: ref,
        status: data.status,
        filename: data.filename,
        obligationsCount: data.obligations?.length || 0,
        timestamp: new Date(data.timestamp).toISOString(),
        age: Math.round((Date.now() - data.timestamp) / 1000 / 60) + ' minutes'
      };
    });

    return NextResponse.json({
      success: true,
      totalEntries: references.length,
      entries: summaries
    });

  } catch (error) {
    console.error('Debug storage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}