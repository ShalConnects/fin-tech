import React from 'react';

// Enhanced skeleton for account cards (mobile view) - matches real AccountCard structure
export const AccountCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Account Header - matches real structure */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Account icon placeholder - matches real account icons */}
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Account name - matches real text styling */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
                {/* Account type badge - matches real badge styling */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-right ml-4">
              {/* Balance - matches real balance styling */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24 animate-pulse"></div>
              {/* Currency - matches real currency styling */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            </div>
          </div>

          {/* Account Stats - matches real stats layout */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12 animate-pulse"></div>
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

// Enhanced skeleton for account table (desktop view) - matches real table structure
export const AccountTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        {/* Table Header - matches real header structure */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {['Account Name', 'Type', 'Currency', 'Balance', 'Transactions', 'DPS', 'Actions'].map((header, index) => (
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
              {/* Account Name - matches real account name structure */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded ml-2 animate-pulse"></div>
                </div>
              </td>
              
              {/* Type - matches real type badge */}
              <td className="px-6 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              </td>
              
              {/* Currency - matches real currency display */}
              <td className="px-6 py-4 text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse mx-auto"></div>
              </td>
              
              {/* Balance - matches real balance display */}
              <td className="px-6 py-4 text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mx-auto"></div>
              </td>
              
              {/* Transactions - matches real transaction count */}
              <td className="px-6 py-4 text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mx-auto"></div>
              </td>
              
              {/* DPS - matches real DPS status */}
              <td className="px-6 py-4 text-center">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse mx-auto"></div>
              </td>
              
              {/* Actions - matches real action buttons */}
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
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

// Enhanced skeleton for account summary cards - matches real summary cards structure
export const AccountSummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3">
      {/* Active Accounts - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Total Transactions - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* DPS Accounts - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-18 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Total Balance - matches real card structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-3 animate-pulse"></div>
        </div>
      </div>
      
      {/* Monthly Growth - matches real card structure */}
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

// Enhanced skeleton for account filters - matches real filter structure
export const AccountFiltersSkeleton: React.FC = () => {
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
            
            {/* Currency Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
            
            {/* Type Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 animate-pulse"></div>
            </div>
            
            {/* Status Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced skeleton for transaction filters - matches real transaction filter structure
export const TransactionFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 flex-1">
            {/* Global Search - matches real search input */}
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg pl-10 animate-pulse"></div>
            </div>
            
            {/* Type Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 animate-pulse"></div>
            </div>
            
            {/* Category Filter - matches real dropdown */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-36 animate-pulse"></div>
            </div>
            
            {/* Account Filter - matches real dropdown */}
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

// Enhanced skeleton for transaction summary cards - matches real transaction summary structure
export const TransactionSummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {/* Total Income - matches real income card */}
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
      
      {/* Total Expenses - matches real expense card */}
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
      
      {/* Net Amount - matches real net amount card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
      
      {/* Transactions - matches real transaction count card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced skeleton for transaction table - matches real transaction table structure
export const TransactionTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        {/* Table Header - matches real transaction table header */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {['Date & Time', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Actions'].map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body - matches real transaction table rows */}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
              {/* Date & Time - matches real date display */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </td>
              
              {/* Description - matches real description display */}
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-40 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </td>
              
              {/* Category - matches real category badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              </td>
              
              {/* Account - matches real account display */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
              </td>
              
              {/* Type - matches real type display */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </td>
              
              {/* Amount - matches real amount display */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse ml-auto"></div>
              </td>
              
              {/* Actions - matches real action buttons */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
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

// Enhanced skeleton for transaction mobile view - matches real mobile transaction structure
export const TransactionMobileSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          {/* Transaction Header - matches real mobile transaction header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              {/* Transaction icon - matches real transaction icons */}
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Description - matches real description styling */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32 animate-pulse"></div>
                {/* Date - matches real date styling */}
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-right ml-4">
              {/* Amount - matches real amount styling */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24 animate-pulse"></div>
              {/* Account - matches real account styling */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          {/* Transaction Details - matches real transaction details */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
                              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
          </div>

          {/* Action Buttons - matches real mobile action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading overlay with spinner - matches real loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};

// Shimmer effect component - enhanced shimmer
export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
}; 