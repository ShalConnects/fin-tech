import React, { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'gray' | 'yellow';
  trend?: 'up' | 'down';
  insight?: React.ReactNode;
  trendGraph?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color = 'gray',
  trend,
  insight,
  trendGraph
}) => {
  const insightRef = useRef<HTMLDivElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  // Check if text needs marquee effect
  useEffect(() => {
    if (insightRef.current) {
      const element = insightRef.current;
      const isOverflowing = element.scrollWidth > element.clientWidth;
      setShouldMarquee(isOverflowing);
    }
  }, [insight]);
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    gray: 'bg-gray-100',
    yellow: 'bg-yellow-100'
  };

  const valueColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-900 dark:text-white',
    yellow: 'text-yellow-600',
  };

  // Animated number
  useEffect(() => {
    // The animated number logic is removed as value can now be a ReactNode.
    // If value is a number, it will be displayed directly.
    // If value is a string starting with '$', it will be displayed as is.
    // If value is a string not starting with '$', it will be displayed as is.
  }, [value]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide uppercase">{title}</p>
          <p className={`text-lg font-bold mb-1 transition-all duration-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 ${valueColors[color] || valueColors.gray}`}>{value}</p>
          {change && (
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </div>
          )}
          {trend && false && (
            <div className="flex items-center mt-1">
              <span className={`text-xs ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColors[color]} dark:bg-opacity-20 shadow-inner`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
        )}
      </div>
      
      {/* Bottom row with insight text and trend graph */}
      {(insight || trendGraph) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {insight && (
            <div className="flex-1 min-w-0 mr-2">
              <div 
                ref={insightRef}
                className={`overflow-hidden hide-scrollbar ${shouldMarquee ? 'marquee-container' : ''}`}
              >
                <div className={`whitespace-nowrap ${shouldMarquee ? 'marquee-text' : ''}`}>
                  {insight}
                </div>
              </div>
            </div>
          )}
          {trendGraph && (
            <div className="flex-shrink-0 w-16 h-6 flex items-end">
              {trendGraph}
            </div>
          )}
        </div>
      )}
    </div>
  );
};