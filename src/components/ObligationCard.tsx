import { Obligation } from '@/types';

interface ObligationCardProps {
  obligation: Obligation;
  isPreview?: boolean;
}

export default function ObligationCard({ obligation, isPreview = false }: ObligationCardProps) {
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-sm transition-all duration-200 ${isPreview ? 'opacity-100' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
        <div className={`inline-flex items-center px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border-l-4 ${getPartyColor(obligation.responsible_party)}`}>
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center mr-2 ${getPartyBadgeColor(obligation.responsible_party)}`}>
            <div className="text-white text-xs font-bold">
              {getPartyIcon(obligation.responsible_party)}
            </div>
          </div>
          <span className="truncate">{obligation.responsible_party}</span>
        </div>
        
        <div className="flex items-center bg-gray-100 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm text-gray-700 self-start sm:self-auto">
          <div className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mr-2 flex-shrink-0">
            {getDeadlineIcon()}
          </div>
          <span className="truncate">{formatDeadline(obligation.deadline)}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
          {obligation.obligation}
        </p>
      </div>
      
      {/* Confidence indicator */}
      {obligation.confidence && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 sm:space-y-0">
          <div className="flex items-center flex-1">
            <span className="text-xs sm:text-sm font-medium text-gray-700 mr-2 sm:mr-3 whitespace-nowrap">AI Confidence:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  obligation.confidence > 0.8 ? 'bg-green-500' : 
                  obligation.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(obligation.confidence || 0) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={`ml-0 sm:ml-3 px-2 py-1 rounded text-xs font-medium self-start sm:self-auto ${
            obligation.confidence > 0.8 ? 'bg-green-100 text-green-800' : 
            obligation.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {Math.round((obligation.confidence || 0) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}