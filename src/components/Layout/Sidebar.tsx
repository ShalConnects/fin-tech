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
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { triggerHapticFeedback } from '../../utils/hapticFeedback';

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
  
  const { isMobile, isVerySmall } = useMobileDetection();
  
  // Swipe-to-close functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Force collapse on mobile - always collapsed on mobile
  const effectiveCollapsed = isMobile ? true : isSidebarCollapsed;

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

  // Swipe-to-close functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isMobile && isOpen) {
      triggerHapticFeedback('light');
      onToggle();
    }
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop md:hidden"
          onClick={() => {
            triggerHapticFeedback('light');
            onToggle();
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          sidebar-mobile
          ${isOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-closed'} 
          md:sidebar-desktop
          ${isMobile ? (isOpen ? 'w-64' : 'w-16') : (effectiveCollapsed ? 'w-16' : 'w-52')}
          sidebar-scroll
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
            isMobile ? (isOpen ? 'px-6 py-4' : 'p-2') : (effectiveCollapsed ? 'px-2 py-4' : 'px-6 py-4')
          }`}>
            {(!isMobile && !effectiveCollapsed) || (isMobile && isOpen) ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">FinanceFlow</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            )}
            <button 
              onClick={() => {
                triggerHapticFeedback('light');
                onToggle();
              }}
              className="md:hidden touch-button rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-active"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 space-y-2 pt-4 pl-2 ${
            isMobile ? (isOpen ? 'pr-4' : 'pr-2') : (effectiveCollapsed ? 'pr-2' : 'pr-4')
          }`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isAnalyticsActive = Boolean(currentView === 'analytics' || currentView === 'purchase-analytics' || currentView === 'lend-borrow-analytics');
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      triggerHapticFeedback('light');
                      onViewChange(item.id);
                      if (isMobile) onToggle();
                    }}
                    className={`
                      w-full flex items-center rounded-lg sidebar-nav-item
                      ${isMobile ? (isOpen ? 'px-4 py-3 space-x-3' : 'px-2 py-3 justify-center') : (effectiveCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 space-x-3')}
                      ${isMobile ? 'sidebar-nav-mobile' : ''}
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400 text-gradient-primary font-semibold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:via-blue-50/30 hover:to-gray-50 dark:hover:from-gray-700/50 dark:hover:via-blue-900/10 dark:hover:to-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }
                      touch-active
                    `}
                    title={isMobile || effectiveCollapsed ? t(item.name) : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gradient-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    {(!isMobile && !effectiveCollapsed) || (isMobile && isOpen) ? (
                      <span className="text-[14px] font-bold">{t(item.name)}</span>
                    ) : null}
                  </button>
                  
                  {/* Subcategories for Analytics */}
                  {item.id === 'analytics' && isAnalyticsActive && (!effectiveCollapsed || (isMobile && isOpen)) && (
                    <div className={`mt-2 space-y-1 ${isMobile && isOpen ? 'ml-6' : 'ml-6'}`}>
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
          <div className={`border-t border-gray-200 dark:border-gray-700 ${
            isMobile ? (isOpen ? 'px-4 py-4' : 'p-2') : (effectiveCollapsed ? 'px-2 py-4' : 'px-4 py-4')
          }`}>
            <div className="flex items-center space-x-2">
              <Link
                to="/help"
                onClick={() => {
                  if (isMobile) {
                    triggerHapticFeedback('light');
                    onToggle();
                  }
                }}
                className={`flex-1 flex items-center px-3 py-2 mt-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors ${
                  isMobile ? (isOpen ? 'space-x-3' : 'justify-center px-2') : (effectiveCollapsed ? 'justify-center px-2' : 'space-x-3')
                }`}
                title={isMobile || effectiveCollapsed ? 'Help & Support' : undefined}
              >
                <HelpCircle className="w-4 h-4" />
                {(!isMobile && !effectiveCollapsed) || (isMobile && isOpen) ? (
                  <span className="text-[13px]">Help & Support</span>
                ) : null}
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