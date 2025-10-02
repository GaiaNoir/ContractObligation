import { Obligation } from '@/types';
import { ResultsSummary as SummaryData } from '@/models';

interface ResultsSummaryProps {
  obligations: Obligation[];
  summary?: SummaryData;
}

export default function ResultsSummary({ obligations, summary }: ResultsSummaryProps) {
  // Use provided summary data or calculate from obligations
  const totalObligations = summary?.totalObligations ?? obligations.length;
  
  const partyCounts = summary?.obligationsByParty ?? obligations.reduce((acc, obligation) => {
    const party = obligation.responsible_party;
    acc[party] = (acc[party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deadlineObligations = obligations.filter(
    o => o.deadline && o.deadline !== 'Not specified' && o.deadline !== 'none'
  ).length;

  const averageConfidence = summary?.averageConfidence ?? 
    (obligations.length > 0 ? obligations.reduce((sum, o) => sum + (o.confidence || 0), 0) / obligations.length : 0);

  const requiresReviewCount = summary?.requiresReviewCount ?? 
    obligations.filter(o => (o.confidence || 0) < 0.6).length;

  // Calculate additional statistics for new fields
  const withConditions = obligations.filter(
    o => o.conditions && o.conditions !== 'None'
  ).length;

  const getSummaryStats = () => {
    return [
      {
        label: 'Total Obligations',
        value: totalObligations,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'text-blue-600 bg-blue-100'
      },
      {
        label: 'With Deadlines',
        value: deadlineObligations,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-orange-600 bg-orange-100'
      },
      {
        label: 'With Conditions',
        value: withConditions,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-purple-600 bg-purple-100'
      },
      {
        label: 'Needs Review',
        value: requiresReviewCount,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        color: 'text-yellow-600 bg-yellow-100'
      }
    ];
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Summary</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {getSummaryStats().map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-2 sm:p-3 text-center border border-gray-200">
            <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} mb-1 sm:mb-2`}>
              {stat.icon}
            </div>
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Party breakdown */}
      {Object.keys(partyCounts).length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Responsibility Breakdown</h4>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {Object.entries(partyCounts).map(([party, count]) => (
              <span
                key={party}
                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  party === 'Party A' ? 'bg-blue-100 text-blue-800' :
                  party === 'Party B' ? 'bg-green-100 text-green-800' :
                  party === 'Both' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {party}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Element type breakdown */}
      {(() => {
        const elementTypes = obligations.reduce((acc, obligation) => {
          if (obligation.element_type) {
            acc[obligation.element_type] = (acc[obligation.element_type] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        return Object.keys(elementTypes).length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Element Types</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
              {Object.entries(elementTypes)
                .sort(([,a], [,b]) => b - a) // Sort by count descending
                .slice(0, 6) // Show top 6 types
                .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center py-1">
                  <span className="text-gray-600 truncate pr-2" title={type}>{type}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
            {Object.keys(elementTypes).length > 6 && (
              <div className="text-xs text-gray-500 mt-2">
                +{Object.keys(elementTypes).length - 6} more types
              </div>
            )}
          </div>
        );
      })()}

      {/* Deadline type breakdown */}
      {summary?.obligationsByDeadlineType && Object.keys(summary.obligationsByDeadlineType).length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Deadline Types</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
            {Object.entries(summary.obligationsByDeadlineType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center py-1">
                <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}