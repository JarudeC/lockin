'use client';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'indigo', 
  text,
  fullScreen = false,
  className = '',
  overlay = false 
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const colors = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinnerElement = (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={`ml-3 text-sm font-medium ${colors[color]}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        overlay ? 'bg-black bg-opacity-50' : 'bg-white'
      }`}>
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Page Loading Component
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  </div>
);

// Card Loading Skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-300" />
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded" />
            <div className="h-3 bg-gray-300 rounded w-5/6" />
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="h-4 bg-gray-300 rounded w-1/4" />
            <div className="h-8 bg-gray-300 rounded w-1/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="h-4 bg-gray-300 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Form Loading Skeleton
export const FormSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded w-1/4" />
      <div className="h-10 bg-gray-300 rounded" />
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded w-1/3" />
      <div className="h-24 bg-gray-300 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/2" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/2" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>
    </div>
    <div className="flex justify-end space-x-3">
      <div className="h-10 bg-gray-300 rounded w-20" />
      <div className="h-10 bg-gray-300 rounded w-24" />
    </div>
  </div>
);

// Stats Loading Skeleton
export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 animate-pulse">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded" />
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Inline Loading Indicator
export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="sm" />
    <span className="ml-2 text-sm text-gray-600">{text}</span>
  </div>
);

export default LoadingSpinner;