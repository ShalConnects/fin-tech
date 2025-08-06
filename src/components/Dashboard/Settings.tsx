import { useState, useEffect } from 'react';
import { PurchaseCategories } from '../Purchases/PurchaseCategories';
import { IncomeCategories } from '../Purchases/IncomeCategories';
import { CurrencySettings } from './CurrencySettings';
import { AccountManagement } from './AccountManagement';
import { Plans } from './Plans';
import { LastWish } from './LastWish';
import { useSearchParams } from 'react-router-dom';

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize activeTab from URL parameter or default to general-settings
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general-settings', 'income-category', 'expense-category', 'account-management', 'plans', 'last-wish'].includes(tabParam)) {
      return tabParam;
    }
    return 'general-settings';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general-settings', 'income-category', 'expense-category', 'account-management', 'plans', 'last-wish'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow dark:shadow-gray-800/50 p-0 pt-0 pb-5 px-5 w-full mt-0">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'general-settings' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('general-settings')}
            type="button"
          >
            General Settings
          </button>
          <button
            className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'income-category' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('income-category')}
            type="button"
          >
            Income Category
          </button>
          <button
            className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'expense-category' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('expense-category')}
            type="button"
          >
            Expense Category
          </button>
          <button
            className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'account-management' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('account-management')}
            type="button"
          >
            Account Management
          </button>
          <button
            className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'plans' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('plans')}
            type="button"
          >
            Plans
          </button>
          <button
            className={`whitespace-nowrap py-1.5 px-0 font-medium text-sm focus:outline-none relative
              ${activeTab === 'last-wish' ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={() => handleTabChange('last-wish')}
            type="button"
          >
            Last Wish
            <span className="ml-0.5 inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              Premium
            </span>
          </button>
        </nav>
      </div>
      {activeTab === 'general-settings' && (
        <CurrencySettings />
      )}
      {activeTab === 'income-category' && (
        <>
          <div className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
            Categories you create here will be available for income transactions.
          </div>
          <IncomeCategories hideTitle />
        </>
      )}
      {activeTab === 'expense-category' && (
        <>
          <div className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
            Categories you create here will be available for both expenses and transactions.
          </div>
          <PurchaseCategories hideTitle />
        </>
      )}
      {activeTab === 'account-management' && (
        <AccountManagement hideTitle />
      )}
      {activeTab === 'plans' && (
        <Plans />
      )}
      {activeTab === 'last-wish' && (
        <LastWish setActiveTab={setActiveTab} />
      )}
    </div>
  );
}; 