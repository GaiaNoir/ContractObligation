interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-2 sm:ml-3 flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-red-800">
            Error Processing File
          </h3>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
            <pre className="whitespace-pre-wrap font-sans break-words">{message}</pre>
          </div>
          {onRetry && (
            <div className="mt-3 sm:mt-4">
              <button
                onClick={onRetry}
                className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}