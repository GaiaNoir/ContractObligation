'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [reference, setReference] = useState('');
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDebug = async () => {
    if (!reference.trim()) {
      alert('Please enter a payment reference');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/debug/payment?reference=${encodeURIComponent(reference.trim())}`);
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      setDebugData({ error: 'Failed to fetch debug data', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Debug Tool</h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference (from URL or Paystack)
              </label>
              <input
                type="text"
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payment reference..."
              />
            </div>
            
            <button
              onClick={handleDebug}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Debugging...' : 'Debug Payment'}
            </button>
          </div>

          {debugData && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Results</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}