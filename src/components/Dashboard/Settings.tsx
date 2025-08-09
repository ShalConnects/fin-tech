import { useState, useEffect } from 'react';
import { PurchaseCategories } from '../Purchases/PurchaseCategories';
import { IncomeCategories } from '../Purchases/IncomeCategories';
import { CurrencySettings } from './CurrencySettings';
import { AccountManagement } from './AccountManagement';
import { Plans } from './Plans';
import { LastWish } from './LastWish';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, Filter } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }> | null;
  premium?: boolean;
}

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    // Close mobile menu when tab is selected
    setIsMobileMenuOpen(false);
  };

  const tabs: TabItem[] = [
    { id: 'general-settings', label: 'General Settings', icon: null },
    { id: 'income-category', label: 'Income Category', icon: null },
    { id: 'expense-category', label: 'Expense Category', icon: null },
    { id: 'account-management', label: 'Account Management', icon: null },
    { id: 'plans', label: 'Plans', icon: null },
    { id: 'last-wish', label: 'Last Wish', icon: null }
  ];

  const getActiveTabLabel = () => {
    return tabs.find(tab => tab.id === activeTab)?.label || 'General Settings';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow dark:shadow-gray-800/50 p-0 pt-0 pb-5 px-4 sm:px-5 w-full mt-0">
      {/* Mobile Tab Selector - Enhanced to match CustomDropdown styling */}
      <div className="block sm:hidden mb-4 pt-2.5">
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left text-sm h-10"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {getActiveTabLabel()}
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isMobileMenuOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {/* Mobile Dropdown Menu - Styled like CustomDropdown */}
          {isMobileMenuOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 shadow-xl rounded-lg max-h-60 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-gradient-primary text-white font-semibold' 
                      : 'text-gray-700 dark:text-gray-100'
                  } ${tab.id === 'last-wish' ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.premium && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      Premium
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <svg className="w-4 h-4 text-white ml-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex flex-wrap gap-4 lg:gap-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`whitespace-nowrap py-2 px-0 font-medium text-sm focus:outline-none relative transition-colors ${
                activeTab === tab.id 
                  ? 'text-gradient-primary after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => handleTabChange(tab.id)}
              type="button"
            >
              <div className="flex items-center gap-2">
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {tab.premium && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    Premium
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
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
    </div>
  );
}; 