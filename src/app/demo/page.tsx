'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Upload Contract",
      description: "Start by uploading a PDF contract",
      content: (
        <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Sample: Service_Agreement_2024.pdf</p>
              <p className="text-xs text-gray-500 mt-1">15 pages • 2.3 MB</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Processing",
      description: "Our AI analyzes the contract in real-time",
      content: (
        <div className="bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4">
              <p className="text-sm text-blue-700 font-medium">Analyzing contract...</p>
              <div className="mt-2 space-y-1 text-xs text-blue-600">
                <p>✓ Extracting text from document</p>
                <p>✓ Identifying contract parties</p>
                <p>✓ Finding obligations and deadlines</p>
                <p>⏳ Organizing results...</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Results Generated",
      description: "Clean, organized obligations ready for review",
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Service Provider</span>
              <span className="text-xs text-gray-500">Due: Within 5 business days</span>
            </div>
            <p className="text-sm text-gray-700">Deliver initial project proposal and timeline</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Client</span>
              <span className="text-xs text-gray-500">Due: 30 days from invoice</span>
            </div>
            <p className="text-sm text-gray-700">Make payment within 30 days of receiving invoice</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Both Parties</span>
              <span className="text-xs text-gray-500">Duration: 2 years post-termination</span>
            </div>
            <p className="text-sm text-gray-700">Maintain confidentiality of proprietary information</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Service Provider</span>
              <span className="text-xs text-gray-500">Due: Monthly by 5th</span>
            </div>
            <p className="text-sm text-gray-700">Submit monthly progress reports by the 5th of each month</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">ContractObligation</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
          >
            Back to Home
          </Link>
          <Link
            href="/"
            className="btn-primary"
          >
            Try Now - $5
          </Link>
        </div>
      </nav>

      {/* Demo Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            See ContractObligation in Action
          </h1>
          <p className="text-xl text-gray-600">
            Watch how we transform a complex contract into clear, actionable obligations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {demoSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < demoSteps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {demoSteps.map((step, index) => (
              <span key={index} className="text-center flex-1">
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {demoSteps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {demoSteps[currentStep].description}
            </p>
          </div>
          
          <div className="min-h-[300px] flex items-center justify-center">
            {demoSteps[currentStep].content}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {demoSteps.length}
          </div>
          
          {currentStep < demoSteps.length - 1 ? (
            <button
              onClick={nextStep}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Try It Now - $5
            </Link>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Why Legal Teams Love ContractObligation
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save 95% Time</h3>
              <p className="text-gray-600">
                What takes hours of manual review now takes 2 minutes with AI
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Never Miss Deadlines</h3>
              <p className="text-gray-600">
                Automatically identify all deadlines and responsible parties
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Legal Costs</h3>
              <p className="text-gray-600">
                $5 per contract vs thousands in legal review fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to Extract Your Contract Obligations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of legal professionals who trust ContractObligation
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Start Processing - $5 per Contract
          </Link>
        </div>
      </div>
    </div>
  );
}