import { Obligation } from '@/types';
import { useState } from 'react';

interface ObligationCardProps {
  obligation: Obligation;
  isPreview?: boolean;
}

export default function ObligationCard({ obligation, isPreview = false }: ObligationCardProps) {
  const [showSource, setShowSource] = useState(false);
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'party a':
        return 'bg-blue-50 text-blue-800 border-blue-500';
      case 'party b':
        return 'bg-green-50 text-green-800 border-green-500';
      case 'both parties':
      case 'both':
        return 'bg-purple-50 text-purple-800 border-purple-500';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-500';
    }
  };

  const getPartyBadgeColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'party a':
        return 'bg-blue-600';
      case 'party b':
        return 'bg-green-600';
      case 'both parties':
      case 'both':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPartyIcon = (party: string) => {
    switch (party.toLowerCase()) {
      case 'party a':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'party b':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'both parties':
      case 'both':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getDeadlineIcon = () => {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline || deadline.toLowerCase() === 'none' || deadline.toLowerCase() === 'not specified') {
      return 'No deadline specified';
    }
    return deadline;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-50 text-red-800 border-red-500';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-500';
      case 'Low':
        return 'bg-green-50 text-green-800 border-green-500';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-500';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-600';
      case 'Medium':
        return 'bg-yellow-600';
      case 'Low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'Medium':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Low':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${isPreview ? 'opacity-100' : ''}`}>
      {/* Risk Alert Banner */}
      {obligation.risk && (
        <div className={`px-4 py-3 border-l-4 ${getRiskColor(obligation.risk.level)}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${getRiskBadgeColor(obligation.risk.level)}`}>
              <div className="text-white text-sm">
                {getRiskIcon(obligation.risk.level)}
              </div>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-sm">{obligation.risk.level} Risk</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-600">{obligation.risk.explanation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contract Source Information */}
      {obligation.contractSource && (
        <div className="px-4 py-3 bg-gray-50 border-l-4 border-gray-400">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800 mb-1">Contract Document</div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{obligation.contractSource.filename}</span>
                {obligation.contractSource.pageInfo && (
                  <>
                    <span>•</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {obligation.contractSource.pageInfo}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        {/* Header with Party and Deadline */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPartyBadgeColor(obligation.responsible_party)}`}>
              <div className="text-white font-bold text-sm">
                {obligation.responsible_party.toLowerCase() === 'party a' ? 'A' :
                 obligation.responsible_party.toLowerCase() === 'party b' ? 'B' :
                 obligation.responsible_party.toLowerCase().includes('both') ? '⚬' :
                 obligation.responsible_party.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">RESPONSIBLE PARTY</div>
              <div className={`text-lg font-bold ${
                obligation.responsible_party.toLowerCase() === 'party a' ? 'text-blue-700' :
                obligation.responsible_party.toLowerCase() === 'party b' ? 'text-green-700' :
                obligation.responsible_party.toLowerCase().includes('both') ? 'text-purple-700' :
                'text-gray-900'
              }`}>
                {obligation.responsible_party}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-orange-50 px-4 py-2 rounded border border-orange-200">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">DEADLINE</div>
              <div className="text-sm font-semibold text-gray-800">{formatDeadline(obligation.deadline)}</div>
            </div>
          </div>
        </div>
        
        {/* Obligation Text */}
        <div className="bg-gray-50 rounded p-4 border border-gray-200 mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">OBLIGATION</div>
          <p className="text-base text-gray-800 leading-relaxed">
            {obligation.obligation}
          </p>
        </div>
        {/* Confidence indicator */}
        {obligation.confidence && (
          <div className="bg-blue-50 rounded p-4 border border-blue-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">AI Confidence</span>
              </div>
              <div className={`px-2 py-1 rounded text-sm font-semibold ${
                obligation.confidence > 0.8 ? 'bg-green-100 text-green-800' : 
                obligation.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {Math.round((obligation.confidence || 0) * 100)}%
              </div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    obligation.confidence > 0.8 ? 'bg-green-500' : 
                    obligation.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(obligation.confidence || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Source Traceability */}
        {obligation.source && (
          <div className="border border-gray-300 rounded overflow-hidden bg-gray-50">
            <button
              onClick={() => setShowSource(!showSource)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Source in Contract</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {obligation.source.pageNumber && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        Page {obligation.source.pageNumber}
                      </span>
                    )}
                    {obligation.source.matchScore && obligation.source.matchScore < 1.0 && (
                      <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                        ~{Math.round(obligation.source.matchScore * 100)}% match
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showSource ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSource && (
              <div className="p-4 bg-white border-t border-gray-300">
                <div className="space-y-4">
                  {/* Source text */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">ORIGINAL TEXT</h4>
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{obligation.source.text}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Location details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {obligation.source.pageNumber && (
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">Page {obligation.source.pageNumber}</span>
                      </div>
                    )}
                    
                    {obligation.source.lineNumber && (
                      <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded border border-green-200">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Line {obligation.source.lineNumber}</span>
                      </div>
                    )}
                    
                    {obligation.source.startIndex !== undefined && (
                      <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded border border-purple-200">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-purple-800">Char {obligation.source.startIndex}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}