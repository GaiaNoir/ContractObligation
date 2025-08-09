'use client';

import { useState } from 'react';
import { Obligation } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ObligationCard from './ObligationCard';
import ResultsSummary from './ResultsSummary';

interface ContractProcessorProps {
  onBackToHome: () => void;
}

export default function ContractProcessor({ onBackToHome }: ContractProcessorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [filename, setFilename] = useState('');
  const [pageInfo, setPageInfo] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };



  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a PDF or Word document (.pdf, .docx, .doc).';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB. Please compress your PDF or split it into smaller files.';
    }
    
    if (file.size === 0) {
      return 'The selected file appears to be empty. Please select a valid PDF file.';
    }
    
    return null;
  };

  const updateProgress = (stage: string, progressValue: number) => {
    setProcessingStage(stage);
    setProgress(progressValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setError(''); // Clear any previous errors when a new file is selected
    }
  };

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsAiProcessing(false);
    setError('');
    setAiError('');
    setExtractedText('');
    setObligations([]);
    setPageInfo('');
    setShowPreview(false);
    setProgress(0);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('document') as File;

    if (!file) {
      setError('Please select a document file');
      setIsLoading(false);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    trackEvent('file_upload_started', {
      file_size: file.size,
      file_name: file.name
    });

    try {
      updateProgress('Uploading file...', 10);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress('Extracting text from document...', 30);
      setIsAiProcessing(true);
      
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        updateProgress('AI analyzing obligations...', 70);
        
        setExtractedText(data.text);
        setObligations(data.obligations || []);
        setFilename(data.filename);
        setShowPreview(true);
        
        updateProgress('Complete!', 100);
        
        if (data.aiError) {
          setAiError(data.aiError);
        }
        
        let info = `${data.pages} page${data.pages !== 1 ? 's' : ''}`;
        if (data.processedPages && data.processedPages < data.pages) {
          info += ` (${data.processedPages} processed)`;
        }
        setPageInfo(info);

        trackEvent('extraction_completed', {
          obligations_count: data.obligations?.length || 0,
          pages: data.pages,
          success: true
        });
      } else {
        let errorMsg = data.error || 'Failed to extract text';
        if (data.details) {
          errorMsg += `\n\nDetails: ${data.details}`;
        }
        if (data.suggestion) {
          errorMsg += `\n\nSuggestion: ${data.suggestion}`;
        }
        if (data.fileSize) {
          errorMsg += `\n\nFile was received successfully (${data.fileSize} bytes)`;
        }
        setError(errorMsg);

        trackEvent('extraction_failed', {
          error: data.error,
          file_size: file.size
        });
      }
    } catch (err) {
      const errorMessage = 'An error occurred while processing the file. Please try again.';
      setError(errorMessage);
      
      trackEvent('extraction_error', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
      setIsAiProcessing(false);
      setProcessingStage('');
      setProgress(0);
    }
  };

  const handlePaymentClick = () => {
    trackEvent('payment_initiated');
    setShowEmailInput(true);
  };

  const handlePayment = async (email: string) => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setShowEmailInput(false);
      
      const storeResponse = await fetch('/api/store-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          obligations,
          extractedText,
          filename,
          pageInfo
        }),
      });

      const storeData = await storeResponse.json();
      if (!storeResponse.ok) {
        throw new Error(storeData.error || 'Failed to store results');
      }

      const reference = storeData.reference;
      setPaymentReference(reference);

      const paymentResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: 90, // R90 ZAR (equivalent to $5 USD)
          metadata: {
            reference,
            filename,
            obligations_count: obligations.length
          }
        }),
      });

      const paymentData = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      if (!paymentData.data) {
        throw new Error('Invalid payment response - no data received');
      }

      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => initializePaystack(paymentData.data, email);
        document.head.appendChild(script);
      } else {
        initializePaystack(paymentData.data, email);
      }

      trackEvent('payment_popup_opened', {
        amount: 90,
        obligations_count: obligations.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(errorMessage);
      
      trackEvent('payment_failed', {
        error: errorMessage
      });
    }
  };

  const initializePaystack = (paymentData: any, email: string) => {
    const amount = paymentData.amount || 9000;
    
    try {
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
        email,
        amount: amount,
        currency: 'ZAR',
        ref: paymentData.reference,
        metadata: paymentData.metadata,
        callback: function(response: any) {
          trackEvent('payment_successful', {
            reference: response.reference,
            amount: amount
          });
          window.location.href = `/results?reference=${response.reference}`;
        },
        onClose: function() {
          trackEvent('payment_cancelled');
        }
      });
      
      handler.openIframe();
    } catch (error) {
      const errorMessage = 'Failed to initialize payment popup: ' + (error instanceof Error ? error.message : 'Unknown error');
      setError(errorMessage);
      
      trackEvent('payment_popup_error', {
        error: errorMessage
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={onBackToHome}
            className="flex items-center text-blue-600 hover:text-blue-800 bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-200 hover:border-blue-300 btn-hover text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">ContractObligation</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 hidden sm:block">Upload a PDF contract to automatically extract obligations using AI</p>
              </div>
            </div>
          </div>
          
          <div className="w-16 sm:w-32"></div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 border border-gray-200">
          <form onSubmit={handleFileUpload} className="space-y-6 sm:space-y-8">
            <div>
              <label htmlFor="document" className="block text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Select Contract Document (Max 10MB)
              </label>
              <div className={`mt-2 flex justify-center px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
                selectedFile 
                  ? 'border-green-300 bg-green-50 hover:border-green-400' 
                  : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
              }`}>
                <div className="space-y-3 sm:space-y-4 text-center">
                  {selectedFile ? (
                    // File selected state
                    <>
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-base sm:text-lg text-gray-700">
                        <div className="font-semibold text-green-700 mb-2">File Selected</div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{selectedFile.name}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                        <label htmlFor="document" className="inline-block mt-3 cursor-pointer text-blue-600 font-medium hover:text-blue-700 underline text-sm sm:text-base">
                          Choose a different file
                          <input
                            id="document"
                            name="document"
                            type="file"
                            accept=".pdf,.docx,.doc"
                            required
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    // No file selected state
                    <>
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center text-base sm:text-lg text-gray-700">
                        <label htmlFor="document" className="relative cursor-pointer text-blue-600 font-semibold hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 rounded-lg px-2 py-1">
                          <span>Upload a document</span>
                          <input
                            id="document"
                            name="document"
                            type="file"
                            accept=".pdf,.docx,.doc"
                            required
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="sm:pl-2 mt-1 sm:mt-0">or drag and drop</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>PDF, DOCX, DOC up to 10MB</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span>Secure & Private</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base">
                      {processingStage || (isAiProcessing ? 'AI Processing...' : 'Extracting...')}
                    </span>
                  </div>
                ) 
                : (
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Extract Obligations
                  </div>
                )}
            </button>
            
            {/* Progress Bar */}
            {isLoading && progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </form>

          {error && <ErrorMessage message={error} />}
          {aiError && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong className="font-semibold">AI Processing Warning:</strong>
                  <p className="mt-1">{aiError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Preview */}
        {showPreview && obligations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Contract Obligations Preview</h2>
                  <p className="text-gray-600">AI analysis complete</p>
                </div>
              </div>
              <div className="text-right">
                {filename && (
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 mb-2">
                    <span className="text-sm font-medium text-blue-800">📄 {filename}</span>
                  </div>
                )}
                {pageInfo && (
                  <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-green-800">📊 {pageInfo}</span>
                  </div>
                )}
              </div>
            </div>

            <ResultsSummary obligations={obligations} />

            {/* Preview notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Preview Mode - Showing first {Math.min(3, obligations.length)} of {obligations.length} obligations
                  </h3>
                  <p className="text-yellow-700">
                    Pay $5 to unlock all {obligations.length} obligations and download options
                  </p>
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-green-700">Full analysis complete</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-blue-700">PDF export ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview obligations (first 3) */}
            <div className="grid gap-4 mb-6">
              {obligations.slice(0, 3).map((obligation, index) => (
                <ObligationCard key={index} obligation={obligation} isPreview={true} />
              ))}
            </div>

            {/* Payment section */}
            <div className="text-center border-t border-gray-200 pt-8">
              {obligations.length > 3 && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{obligations.length - 3}</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {obligations.length - 3} more obligations hidden
                    </p>
                  </div>
                  <p className="text-gray-600">
                    Get full access to all obligations plus PDF/text download
                  </p>
                </div>
              )}
              
              {!showEmailInput ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-green-800">Only $5</h3>
                        <p className="text-green-700">One-time payment</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700">All {obligations.length} obligations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700">PDF export</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700">Text export</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700">Instant access</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePaymentClick}
                    className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold text-xl"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pay $5 to {obligations.length > 3 ? 'See Full Results' : 'Download Results'}
                      <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Enter Your Email</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handlePayment(userEmail)}
                        className="flex-1 btn-primary py-3"
                      >
                        Pay $5
                      </button>
                      <button
                        onClick={() => setShowEmailInput(false)}
                        className="flex-1 btn-secondary py-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}