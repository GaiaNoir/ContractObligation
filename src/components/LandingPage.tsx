'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LandingPageProps {
  onGetStartedAction: () => void;
}

export default function LandingPage({ onGetStartedAction }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const handleGetStarted = () => {
    trackEvent('get_started_clicked', { source: 'hero_button' });
    onGetStartedAction();
  };

  const handleDemoClick = () => {
    trackEvent('demo_viewed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
      
      {/* Navigation */}
      <nav className={`relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">ContractObligation</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Legal Analysis Platform</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/demo" className="text-gray-600 hover:text-gray-900 font-medium">Demo</Link>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How it Works</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-gray-600 hover:text-gray-900 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="mb-4 sm:mb-6">
              <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Analysis
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Extract contract obligations in 
              <span className="text-blue-600"> 2 minutes</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Upload your PDF contract and our AI instantly extracts all obligations, deadlines, and responsible parties. 
              <span className="font-semibold text-gray-900"> No more manual reading through dense legal documents.</span>
            </p>
            
            {/* Value Props */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 sm:mb-10">
              <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                2-minute processing
              </div>
              <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Only $5 per contract
              </div>
              <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Risk analysis
              </div>
              <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Batch processing
              </div>
              <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Source traceability
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleGetStarted}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg w-full sm:w-auto"
              >
                <span className="flex items-center justify-center">
                  Extract Obligations
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <Link
                href="/demo"
                onClick={handleDemoClick}
                className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  See Demo
                </span>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Demo Card */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} mt-8 lg:mt-0`}>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Contract Analysis</h3>
                    <p className="text-xs sm:text-sm text-gray-500">AI Processing Complete</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-600">Complete</span>
                </div>
              </div>
              
              {/* Risk Alert Banner */}
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium text-red-800">HIGH RISK: Auto-renewal without notice</span>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">A</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-800 font-medium">Party A must deliver goods by March 15, 2024</p>
                      <p className="text-xs text-blue-600 mt-1">Specific deadline • Page 3, Line 45</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">B</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-800 font-medium">Party B shall make payment within 30 days</p>
                      <p className="text-xs text-green-600 mt-1">Relative timeframe • Page 2, Line 12</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 rounded-lg bg-purple-50 border-l-4 border-purple-500">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-800 font-medium">Both parties must maintain confidentiality</p>
                      <p className="text-xs text-purple-600 mt-1">Ongoing obligation • Page 1, Line 8</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">obligations found</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-green-700">2 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Comparison Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-200 mb-4">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              98% Cost Savings
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Save 98% vs Traditional Legal Review</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Get the same contract insights in minutes, not days. See the dramatic difference in cost and time.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Traditional Way */}
            <div className="bg-red-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-200 relative">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Expensive
                </span>
              </div>
              <div className="text-center">
                <div className="bg-red-600 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-800 mb-4 sm:mb-6">Traditional Lawyer Review</h3>
                <div className="space-y-2 sm:space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Hourly Rate:</span>
                    <span className="font-semibold text-red-700 text-sm sm:text-base">$125-$750/hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Time Required:</span>
                    <span className="font-semibold text-red-700 text-sm sm:text-base">2-3 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Wait Time:</span>
                    <span className="font-semibold text-red-700 text-sm sm:text-base">Days to weeks</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3 mt-3 sm:mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-gray-900">Total Cost:</span>
                      <span className="text-xl sm:text-2xl font-bold text-red-700">$250-$600</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ContractObligation Way */}
            <div className="bg-green-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-200 relative">
              <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold">
                  98% SAVINGS
                </span>
              </div>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recommended
                </span>
              </div>
              <div className="text-center mt-6 sm:mt-4">
                <div className="bg-green-600 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 mb-4 sm:mb-6">ContractObligation</h3>
                <div className="space-y-2 sm:space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Fixed Price:</span>
                    <span className="font-semibold text-green-700 text-sm sm:text-base">$5 total</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Time Required:</span>
                    <span className="font-semibold text-green-700 text-sm sm:text-base">2 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-700">Wait Time:</span>
                    <span className="font-semibold text-green-700 text-sm sm:text-base">Instant results</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3 mt-3 sm:mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-gray-900">Total Cost:</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-700">$5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-blue-50 rounded-2xl p-8 max-w-3xl mx-auto border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-blue-900 mb-4">The Bottom Line</h4>
              <p className="text-lg text-blue-800 leading-relaxed">
                Even at the lowest lawyer rate of $125/hour, just 1 hour of review costs $125. 
                <span className="font-bold text-blue-900"> You save $120+ on every single contract.</span>
              </p>
              <div className="mt-6">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary text-lg px-10 py-4"
                >
                  <span className="flex items-center">
                    Start Saving Today
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-4">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simple Process
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Three simple steps to extract all contract obligations automatically</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">1. Upload PDF</h3>
                <p className="text-sm sm:text-base text-gray-600">Simply drag and drop your contract PDF or click to browse. We support files up to 10MB.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">2. AI Analysis</h3>
                <p className="text-sm sm:text-base text-gray-600">Our advanced AI reads through your contract and identifies all obligations, deadlines, and parties.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">3. Download Results</h3>
                <p className="text-sm sm:text-base text-gray-600">Get a professional summary with all obligations clearly organized. Export as PDF or text.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* Pricing Section */}
<div id="pricing" className="py-12 sm:py-16 lg:py-20 bg-white">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
    <div className="mb-12 sm:mb-16">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
      <p className="text-lg sm:text-xl text-gray-600">No subscriptions, no hidden fees. Volume discounts available for batch processing.</p>
    </div>
    
    {/* Pricing Tiers */}
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* Single Contract */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Single Contract</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">$5</div>
          <div className="text-gray-600">per contract</div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Perfect for individual contracts</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">All premium features included</span>
          </div>
        </div>
      </div>

      {/* Volume Discount */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-md relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">POPULAR</span>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Volume Discount</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">$4</div>
          <div className="text-gray-600">per contract</div>
          <div className="text-sm text-blue-600 font-medium mt-1">5-9 contracts</div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">20% savings per contract</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Batch processing included</span>
          </div>
        </div>
      </div>

      {/* Bulk Discount */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Discount</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">$3</div>
          <div className="text-gray-600">per contract</div>
          <div className="text-sm text-blue-600 font-medium mt-1">10+ contracts</div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">40% savings per contract</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Maximum value for enterprises</span>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 lg:p-12 border border-blue-200">
      <div className="mb-6 sm:mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">All Plans Include</h3>
        <p className="text-gray-600">Every contract analysis comes with our complete feature set</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 text-left">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Complete obligation extraction</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">AI-powered risk analysis</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Source text traceability</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Batch contract processing</span>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Multi-format support (PDF, DOCX, TXT)</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Deadline identification</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Party responsibility mapping</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Professional PDF export</span>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">Text format download</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base font-medium text-gray-700">2-minute processing</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleGetStarted}
        className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 w-full sm:w-auto"
      >
        Get Started Now
      </button>
    </div>
  </div>
</div>
      {/* Contact Section */}
      <div id="contact" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Questions?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">We're here to help you streamline your contract analysis process.</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm sm:text-base text-gray-600 break-all">tlaliketumile2@gmail.com</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
              <p className="text-sm sm:text-base text-gray-600">Common questions answered</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-sm sm:text-base text-gray-600">Within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}