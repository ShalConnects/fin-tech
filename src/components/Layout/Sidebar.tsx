import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Settings, 
  HelpCircle,
  X,
  ShoppingBag,
  BarChart3,
  Handshake,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/themeStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { name: 'navigation.dashboard', id: 'dashboard', icon: Home },
  { name: 'navigation.accounts', id: 'accounts', icon: CreditCard },
  { name: 'navigation.transactions', id: 'transactions', icon: TrendingUp },
  { name: 'navigation.purchases', id: 'purchases', icon: ShoppingBag },
  { name: 'navigation.lendBorrow', id: 'lend-borrow', icon: Handshake },
  { name: 'navigation.analytics', id: 'analytics', icon: PieChart },
  { name: 'navigation.settings', id: 'settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentView, onViewChange }) => {
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userSectionRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number, direction: 'down' | 'up'} | null>(null);
  const navigate = useNavigate();
  const { isSidebarCollapsed, toggleSidebar } = useThemeStore();
  
  // Check if screen is mobile/tablet (≤767px)
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 767);
      setIsVerySmall(width <= 468);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Force collapse on mobile
  const effectiveCollapsed = isMobile || isSidebarCollapsed;

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Open dropdown and set position/direction
  const handleUserClick = () => {
    setDropdownOpen((v) => !v);
    if (userSectionRef.current) {
      const rect = userSectionRef.current.getBoundingClientRect();
      const dropdownHeight = 192; // estimate: 4 options * 48px each
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Show above
        setDropdownPos({ top: rect.top - dropdownHeight - 4, left: rect.left, direction: 'up' });
      } else {
        // Show below
        setDropdownPos({ top: rect.bottom + 4, left: rect.left, direction: 'down' });
      }
    }
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        userSectionRef.current &&
        !userSectionRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:z-0
        ${effectiveCollapsed ? 'w-16' : 'w-52'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            effectiveCollapsed ? 'px-2' : 'px-6'
          }`}>
            {!effectiveCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">FinanceFlow</span>
              </div>
            )}
            {effectiveCollapsed && (
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            )}
            <button 
              onClick={onToggle}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-2 ${
            effectiveCollapsed ? 'px-2' : 'px-4'
          }`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isAnalyticsActive = Boolean(currentView === 'analytics' || currentView === 'purchase-analytics' || currentView === 'lend-borrow-analytics');
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      if (window.innerWidth < 768) onToggle();
                    }}
                    className={`
                      w-full flex items-center space-x-3 rounded-lg transition-all duration-200
                      ${effectiveCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'}
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400 text-gradient-primary font-semibold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:via-blue-50/30 hover:to-gray-50 dark:hover:from-gray-700/50 dark:hover:via-blue-900/10 dark:hover:to-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                    title={effectiveCollapsed ? t(item.name) : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gradient-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    {!effectiveCollapsed && (
                      <span className="text-[14px] font-bold">{t(item.name)}</span>
                    )}
                  </button>
                  
                  {/* Subcategories for Analytics */}
                  {item.id === 'analytics' && isAnalyticsActive && !effectiveCollapsed && (
                    <div className="ml-6 mt-2 space-y-1">
                      <button
                        onClick={() => {
                          onViewChange('purchase-analytics');
                          if (window.innerWidth < 768) onToggle();
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-left
                          ${currentView === 'purchase-analytics'
                            ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 dark:from-blue-800/30 dark:via-purple-800/30 dark:to-blue-800/30 text-gradient-primary shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:via-blue-50/40 hover:to-gray-50 dark:hover:from-gray-700/50 dark:hover:via-blue-900/15 dark:hover:to-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                          }
                        `}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>{t('navigation.purchaseAnalytics')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onViewChange('lend-borrow-analytics');
                          if (window.innerWidth < 768) onToggle();
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-left
                          ${currentView === 'lend-borrow-analytics'
                            ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 dark:from-blue-800/30 dark:via-purple-800/30 dark:to-blue-800/30 text-gradient-primary shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:via-blue-50/40 hover:to-gray-50 dark:hover:from-gray-700/50 dark:hover:via-blue-900/15 dark:hover:to-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                          }
                        `}
                      >
                        <Handshake className="w-4 h-4" />
                        <span>{t('navigation.lendBorrowAnalytics')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${
            effectiveCollapsed ? 'px-2' : 'px-4'
          }`}>
            <div className="flex items-center space-x-2">
              <Link
                to="/help"
                className={`flex-1 flex items-center space-x-3 px-3 py-2 mt-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                  effectiveCollapsed ? 'justify-center px-2' : ''
                }`}
                title={effectiveCollapsed ? 'Help & Support' : undefined}
              >
                <HelpCircle className="w-4 h-4" />
                {!effectiveCollapsed && (
                  <span className="text-[13px]">Help & Support</span>
                )}
              </Link>
              {/* Only show toggle button on desktop (>767px) */}
              {!isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className={`rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2 ${
                    effectiveCollapsed 
                      ? 'p-2 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-blue-900/20 hover:from-blue-100 hover:via-purple-100 hover:to-blue-100 dark:hover:from-blue-800/30 dark:hover:via-purple-800/30 dark:hover:to-blue-800/30 shadow-sm' 
                      : 'p-1'
                  }`}
                  title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {effectiveCollapsed ? (
                    <ChevronsRight className="w-5 h-5 text-gradient-primary" />
                  ) : (
                    <ChevronsLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};