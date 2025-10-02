'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { Obligation, PaymentData } from '@/types';
import ObligationCard from '@/components/ObligationCard';

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
          errorMessage += ` (Amount: ${resultsData.paymentAmount / 100} ZAR)`;
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
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 25;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 30;

      // Set font to normal throughout - no bold anywhere
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);

      // Helper function to add a new page
      const addNewPage = () => {
        pdf.addPage();
        yPosition = 30;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Contract Obligations Report', margin, 20);
        pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin - 30, 20);
        pdf.setFontSize(12);
        yPosition += 10;
      };

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
          addNewPage();
        }
      };

      // Title
      pdf.setFontSize(16);
      pdf.text('Contract Obligations Report', margin, yPosition);
      yPosition += 20;

      // Document info
      pdf.setFontSize(12);
      pdf.text(`File: ${paymentData.filename}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Pages: ${paymentData.pageInfo}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Total Obligations: ${paymentData.obligations.length}`, margin, yPosition);
      yPosition += 20;

      // Summary section
      const riskCounts = paymentData.obligations.reduce((acc, o) => {
        if (o.risk) {
          acc[o.risk.level] = (acc[o.risk.level] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      if (Object.keys(riskCounts).length > 0) {
        pdf.text('Risk Distribution:', margin, yPosition);
        yPosition += 10;
        Object.entries(riskCounts).forEach(([level, count]) => {
          pdf.text(`  ${level} Risk: ${count} obligation${count !== 1 ? 's' : ''}`, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Obligations header
      pdf.text('Detailed Obligations:', margin, yPosition);
      yPosition += 15;

      // Process each obligation
      paymentData.obligations.forEach((obligation, index) => {
        checkPageBreak(60); // Check if we need space for the obligation

        // Obligation number - start details on the same line
        pdf.text(`${index + 1}.`, margin, yPosition);

        let currentX = margin + 15; // Start details next to the number
        let currentY = yPosition;

        // Contract source (for batch processing)
        if (obligation.contractSource) {
          pdf.text(`Contract: ${obligation.contractSource.filename}`, currentX, currentY);
          currentY += 10;
        }

        // Element type
        if (obligation.element_type) {
          pdf.text(`Element Type: ${obligation.element_type}`, currentX, currentY);
          currentY += 10;
        }

        // Responsible party
        pdf.text(`Responsible Party: ${obligation.responsible_party}`, currentX, currentY);
        currentY += 10;

        // Affected party
        if (obligation.affected_party && obligation.affected_party !== 'N/A') {
          pdf.text(`Affected Party: ${obligation.affected_party}`, currentX, currentY);
          currentY += 10;
        }

        // Deadline
        pdf.text(`Deadline: ${obligation.deadline}`, currentX, currentY);
        currentY += 10;

        // Conditions
        if (obligation.conditions && obligation.conditions !== 'None') {
          pdf.text('Conditions:', currentX, currentY);
          currentY += 8;
          const conditionsLines = pdf.splitTextToSize(obligation.conditions, maxWidth - 40);
          conditionsLines.forEach((line: string) => {
            checkPageBreak(8);
            pdf.text(line, currentX + 10, currentY);
            currentY += 8;
          });
          currentY += 5;
        }

        // Risk information
        if (obligation.risk) {
          pdf.text(`Risk Level: ${obligation.risk.level}`, currentX, currentY);
          currentY += 8;
          pdf.text('Risk Explanation:', currentX, currentY);
          currentY += 8;
          const riskLines = pdf.splitTextToSize(obligation.risk.explanation, maxWidth - 40);
          riskLines.forEach((line: string) => {
            checkPageBreak(8);
            pdf.text(line, currentX + 10, currentY);
            currentY += 8;
          });
          currentY += 5;
        }

        // Obligation description
        pdf.text('Obligation:', currentX, currentY);
        currentY += 8;
        const obligationLines = pdf.splitTextToSize(obligation.obligation, maxWidth - 40);
        obligationLines.forEach((line: string) => {
          checkPageBreak(8);
          pdf.text(line, currentX + 10, currentY);
          currentY += 8;
        });
        currentY += 5;

        // Source information - put Source and Page on same line when possible
        if (obligation.source) {
          let sourceLine = 'Source:';
          if (obligation.source.pageNumber) {
            sourceLine += ` Page ${obligation.source.pageNumber}`;
          }

          pdf.text(sourceLine, currentX, currentY);
          currentY += 8;

          pdf.text('Quote:', currentX, currentY);
          currentY += 8;
          const sourceLines = pdf.splitTextToSize(`"${obligation.source.text}"`, maxWidth - 40);
          sourceLines.forEach((line: string) => {
            checkPageBreak(8);
            pdf.text(line, currentX + 10, currentY);
            currentY += 8;
          });
          currentY += 5;
        }

        yPosition = currentY + 15; // Space between obligations
      });

      // Footer
      pdf.setFontSize(10);
      pdf.text('Generated by ContractObligation AI', margin, pageHeight - 15);
      pdf.text(`Total Pages: ${pdf.getNumberOfPages()}`, pageWidth - margin - 40, pageHeight - 15);

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
      if (obligation.contractSource) {
        content += `${index + 1}. Contract: ${obligation.contractSource.filename}\n`;

        // Add element type if available
        if (obligation.element_type) {
          content += `   Element Type: ${obligation.element_type}\n`;
        }

        content += `   Responsible Party: ${obligation.responsible_party}\n`;

        // Add affected party if available
        if (obligation.affected_party && obligation.affected_party !== 'N/A') {
          content += `   Affected Party: ${obligation.affected_party}\n`;
        }

        content += `   Deadline: ${obligation.deadline}\n`;

        // Add conditions if available
        if (obligation.conditions && obligation.conditions !== 'None') {
          content += `   Conditions: ${obligation.conditions}\n`;
        }

        content += `   Obligation: ${obligation.obligation}\n`;

        // Add risk information if available
        if (obligation.risk) {
          content += `   Risk Level: ${obligation.risk.level}\n`;
          content += `   Risk Explanation: ${obligation.risk.explanation}\n`;
        }

        // Add source information if available
        if (obligation.source) {
          content += `   Source Text: "${obligation.source.text}"\n`;
          if (obligation.source.pageNumber) {
            content += `   Page: ${obligation.source.pageNumber}\n`;
          }
          if (obligation.source.lineNumber) {
            content += `   Line: ${obligation.source.lineNumber}\n`;
          }
        }
        content += `\n`;
      } else {
        content += `${index + 1}. `;

        // Add element type if available
        if (obligation.element_type) {
          content += `Element Type: ${obligation.element_type}\n`;
          content += `   `;
        }

        content += `Responsible Party: ${obligation.responsible_party}\n`;

        // Add affected party if available
        if (obligation.affected_party && obligation.affected_party !== 'N/A') {
          content += `   Affected Party: ${obligation.affected_party}\n`;
        }

        content += `   Deadline: ${obligation.deadline}\n`;

        // Add conditions if available
        if (obligation.conditions && obligation.conditions !== 'None') {
          content += `   Conditions: ${obligation.conditions}\n`;
        }

        content += `   Obligation: ${obligation.obligation}\n`;

        // Add risk information if available
        if (obligation.risk) {
          content += `   Risk Level: ${obligation.risk.level}\n`;
          content += `   Risk Explanation: ${obligation.risk.explanation}\n`;
        }

        // Add source information if available
        if (obligation.source) {
          content += `   Source Text: "${obligation.source.text}"\n`;
          if (obligation.source.pageNumber) {
            content += `   Page: ${obligation.source.pageNumber}\n`;
          }
          if (obligation.source.lineNumber) {
            content += `   Line: ${obligation.source.lineNumber}\n`;
          }
        }
        content += `\n`;
      }
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
                  {/* Check if this is batch processing by looking for contractSource in obligations */}
                  {paymentData.obligations.some(o => o.contractSource) ? (
                    <>
                      Batch Processing Results • {paymentData.obligations.length} obligations from {
                        new Set(paymentData.obligations.map(o => o.contractSource?.filename).filter(Boolean)).size
                      } contracts
                    </>
                  ) : (
                    <>File: {paymentData.filename} • {paymentData.pageInfo}</>
                  )}
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
              <ObligationCard key={index} obligation={obligation} isPreview={false} />
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