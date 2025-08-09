import React from 'react';

// Enhanced skeleton for donation cards (mobile view) - matches real DonationCard structure
export const DonationCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Donation Header - matches real structure */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Donation icon placeholder - matches real donation icons */}
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Transaction ID - matches real text styling */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
                {/* Mode badge - matches real badge styling */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-right ml-4">
              {/* Amount - matches real amount styling */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24 animate-pulse"></div>
              {/* Currency - matches real currency styling */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            </div>
          </div>

          {/* Donation Stats - matches real stats layout */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
          </div>

          {/* Action Buttons - matches real button layout */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20 animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced skeleton for donation table (desktop view) - matches real table structure
export const DonationTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        {/* Table Header - matches real header structure */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {['Date', 'Transaction ID', 'Original Amount', 'Donation Amount', 'Mode', 'Status', 'Actions'].map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body - matches real row structure */}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
              {/* Date - matches real date structure */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </td>
              
              {/* Transaction ID - matches real transaction ID display */}
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              </td>
              
              {/* Original Amount - matches real amount display */}
              <td className="px-6 py-4 text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mx-auto"></div>
              </td>
              
              {/* Donation Amount - matches real donation amount display */}
              <td className="px-6 py-4 text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mx-auto"></div>
              </td>
              
              {/* Mode - matches real mode badge */}
              <td className="px-6 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              </td>
              
              {/* Status - matches real status badge */}
              <td className="px-6 py-4 text-center">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse mx-auto"></div>
              </td>
              
              {/* Actions - matches real action buttons */}
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Enhanced skeleton for donation summary cards - matches real summary cards structure
export const DonationSummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3">
      {/* Total Donations - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Total Savings - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Pending Donations - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-26 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Average Donation - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Success Rate - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced skeleton for donation filters - matches real filter structure
export const DonationFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 flex-1">
            {/* Search - matches real search input */}
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg pl-10 animate-pulse"></div>
            </div>
            
            {/* Mode Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
            
            {/* Status Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 animate-pulse"></div>
            </div>
            
            {/* Currency Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
            
            {/* Date Range Filter - matches real date picker */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced skeleton for donation analytics - matches real analytics structure
export const DonationAnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards - matches real KPI structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Total Savings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-26 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Pending Donations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Success Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Charts Section - matches real charts structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Savings Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-36 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Alerts Section - matches real alerts structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-20 animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-48 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced skeleton for donation form - matches real form structure
export const DonationFormSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Mode */}
          <div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Amount */}
          <div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Currency */}
          <div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Date */}
          <div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Status */}
          <div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Notes */}
          <div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading overlay with spinner - matches real loading overlay
export const DonationLoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading donations...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};

// Shimmer effect component - enhanced shimmer
export const DonationShimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
}; 