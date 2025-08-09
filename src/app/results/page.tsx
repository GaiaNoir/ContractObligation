'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { Obligation, PaymentData } from '@/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!reference) {
      setError('No payment reference provided');
      setIsLoading(false);
      return;
    }

    verifyPaymentAndGetResults();
  }, [reference]);

  const verifyPaymentAndGetResults = async () => {
    try {
      const response = await fetch(`/api/paystack/verify?reference=${reference}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      if (data.data.status !== 'success') {
        throw new Error('Payment was not successful');
      }

      // Get stored results
      const resultsResponse = await fetch(`/api/results?reference=${reference}`);
      const resultsData = await resultsResponse.json();

      if (!resultsResponse.ok) {
        // Provide more detailed error information
        let errorMessage = resultsData.error || 'Failed to get results';
        if (resultsData.paymentStatus) {
          errorMessage += ` (Payment status: ${resultsData.paymentStatus})`;
        }
        if (resultsData.paymentAmount) {
          errorMessage += ` (Amount: ${resultsData.paymentAmount/100} ZAR)`;
        }
        throw new Error(errorMessage);
      }

      setPaymentData(resultsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!paymentData) return;

    setIsDownloading(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 30;

      // Title
      pdf.setFontSize(20);
      pdf.text('Contract Obligations Report', margin, yPosition);
      yPosition += 20;

      // File info
      pdf.setFontSize(12);
      pdf.text(`File: ${paymentData.filename}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Pages: ${paymentData.pageInfo}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;

      // Obligations
      pdf.setFontSize(16);
      pdf.text('Extracted Obligations:', margin, yPosition);
      yPosition += 15;

      paymentData.obligations.forEach((obligation, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. Responsible Party: ${obligation.responsible_party}`, margin, yPosition);
        yPosition += 8;
        
        pdf.text(`Deadline: ${obligation.deadline}`, margin, yPosition);
        yPosition += 8;

        pdf.setFont(undefined, 'normal');
        const lines = pdf.splitTextToSize(obligation.obligation, maxWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 6 + 10;
      });

      pdf.save(`contract-obligations-${paymentData.filename}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadText = () => {
    if (!paymentData) return;

    let content = `Contract Obligations Report\n`;
    content += `File: ${paymentData.filename}\n`;
    content += `Pages: ${paymentData.pageInfo}\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += `Extracted Obligations:\n\n`;

    paymentData.obligations.forEach((obligation, index) => {
      content += `${index + 1}. Responsible Party: ${obligation.responsible_party}\n`;
      content += `   Deadline: ${obligation.deadline}\n`;
      content += `   Obligation: ${obligation.obligation}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-obligations-${paymentData.filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment and loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No results found</p>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract Analysis Results</h1>
              <p className="text-gray-600">Payment verified successfully - here are your full results</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Contract Obligations ({paymentData.obligations.length})
                </h2>
                <p className="text-sm text-gray-500">
                  File: {paymentData.filename} • {paymentData.pageInfo}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={downloadText}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Text
              </button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {paymentData.obligations.map((obligation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border-l-4 ${
                    obligation.responsible_party.toLowerCase() === 'party a' ? 'bg-blue-50 text-blue-800 border-blue-500' :
                    obligation.responsible_party.toLowerCase() === 'party b' ? 'bg-green-50 text-green-800 border-green-500' :
                    obligation.responsible_party.toLowerCase().includes('both') ? 'bg-purple-50 text-purple-800 border-purple-500' :
                    'bg-gray-50 text-gray-800 border-gray-500'
                  }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${
                      obligation.responsible_party.toLowerCase() === 'party a' ? 'bg-blue-600' :
                      obligation.responsible_party.toLowerCase() === 'party b' ? 'bg-green-600' :
                      obligation.responsible_party.toLowerCase().includes('both') ? 'bg-purple-600' :
                      'bg-gray-600'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {obligation.responsible_party.toLowerCase() === 'party a' ? 'A' :
                         obligation.responsible_party.toLowerCase() === 'party b' ? 'B' :
                         obligation.responsible_party.toLowerCase().includes('both') ? '⚭' : '?'}
                      </span>
                    </div>
                    <span>{obligation.responsible_party}</span>
                  </div>
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700">
                    <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{obligation.deadline}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 leading-relaxed">
                    {obligation.obligation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="btn-primary inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Analyze Another Contract
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading results...</p>
      </div>
    </div>}>
      <ResultsContent />
    </Suspense>
  );
}