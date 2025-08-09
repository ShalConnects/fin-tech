import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full',
  rounded = true 
}) => {
  return (
    <div 
      className={`
        bg-gray-200 dark:bg-gray-700 
        animate-pulse 
        ${rounded ? 'rounded' : ''} 
        ${height} 
        ${width} 
        ${className}
      `}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
    <Skeleton className="mb-3" height="h-6" width="w-3/4" />
    <Skeleton className="mb-2" height="h-4" width="w-full" />
    <Skeleton className="mb-2" height="h-4" width="w-2/3" />
    <Skeleton className="mb-4" height="h-4" width="w-1/2" />
    <Skeleton className="mb-2" height="h-8" width="w-full" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
    {/* Table header */}
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        <Skeleton height="h-4" width="w-1/4" />
        <Skeleton height="h-4" width="w-1/4" />
        <Skeleton height="h-4" width="w-1/4" />
        <Skeleton height="h-4" width="w-1/4" />
      </div>
    </div>
    
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex space-x-4">
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-4" width="w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
    <Skeleton className="mb-4" height="h-6" width="w-1/3" />
    <div className="flex items-end justify-between h-32 space-x-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton 
          key={index} 
          height={`h-${Math.floor(Math.random() * 20) + 8}`} 
          width="w-8" 
        />
      ))}
    </div>
  </div>
); 