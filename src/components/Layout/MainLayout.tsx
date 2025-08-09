import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchDropdown } from './GlobalSearchDropdown';
import { Dashboard } from '../Dashboard/Dashboard';
import { AccountsView } from '../Accounts/AccountsView';
import { TransactionsView } from '../Transactions/TransactionsView';
import { ReportsView } from '../Reports/ReportsView';
import { Settings } from '../Dashboard/Settings';
import { About } from '../Dashboard/About';
import { HeaderQuote } from '../Dashboard/HeaderQuote';
import { useThemeStore } from '../../store/themeStore';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { useMobileSidebar } from '../../context/MobileSidebarContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(location.pathname.split('/')[2] || 'dashboard');
  const { isSidebarCollapsed } = useThemeStore();
  
  const { isMobile, isVerySmall } = useMobileDetection();
  const { setIsMobileSidebarOpen } = useMobileSidebar();
  
  // Force collapse on mobile - always collapsed on mobile
  const effectiveCollapsed = isMobile ? true : isSidebarCollapsed;
  
  // Track if this is the initial load to prevent closing sidebar on mount
  const isInitialLoad = useRef(true);
  const previousPathname = useRef(location.pathname);

  // Sync route with currentView and close mobile sidebar on navigation
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    console.log('Route sync - Current location:', location.pathname);
    console.log('Route sync - Path parts:', pathParts);
    
    // Now the path will be directly like /accounts, /transactions, etc.
    let view = 'dashboard';
    if (pathParts[1] && pathParts[1] !== '') {
      view = pathParts[1];
    }
    console.log('Route sync - Setting current view to:', view);
    setCurrentView(view);
  }, [location]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    console.log('Navigation effect triggered:', {
      isInitialLoad: isInitialLoad.current,
      previousPathname: previousPathname.current,
      currentPathname: location.pathname,
      isMobile,
      isSidebarOpen
    });
    
    // Skip on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousPathname.current = location.pathname;
      return;
    }
    
    // Close sidebar if pathname changed and we're on mobile
    if (previousPathname.current !== location.pathname && isMobile) {
      console.log('Closing mobile sidebar due to navigation');
      setIsSidebarOpen(false);
      setIsMobileSidebarOpen(false);
    }
    
    // Update previous pathname
    previousPathname.current = location.pathname;
  }, [location.pathname, isMobile, setIsMobileSidebarOpen]);

  // Scroll to top on route change
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location.pathname]);

  // Update route when currentView changes
  const handleViewChange = (view: string) => {
    console.log('handleViewChange called with:', view);
    
    // When we're inside the Dashboard component, the path will be /accounts
    // instead of /dashboard/accounts
    if (view === 'dashboard') {
      console.log('Navigating to /');
      navigate('/');
    } else {
      console.log('Navigating to:', `/${view}`);
      navigate(`/${view}`);
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'accounts': return 'Accounts';
      case 'transactions': return 'Transactions';
      case 'transfers': return 'Transfer History';
      case 'analytics': return 'Analytics';
      case 'purchases': return 'Purchases';
      case 'purchase-categories': return 'Purchase Categories';
      case 'purchase-analytics': return 'Purchase Analytics';
      case 'lend-borrow': return 'Lend & Borrow';
      case 'lend-borrow-analytics': return 'Lend & Borrow Analytics';
      case 'settings': return 'Settings';
      case 'about': return 'About';
      case 'donations': return 'Donations';
      default: return 'Dashboard';
    }
  };

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden relative z-0">
        {/* Sidebar for desktop only */}
        {!isMobile && (
          <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out ${
            effectiveCollapsed ? 'w-16' : 'w-52'
          }`}>
            <Sidebar 
              isOpen={true} 
              onToggle={() => {}} // No toggle on desktop
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </aside>
        )}
        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          !isMobile ? (effectiveCollapsed ? 'ml-16' : 'ml-52') : ''
        }`}>
          <Header 
            onMenuToggle={() => {
              setIsSidebarOpen(true);
              setIsMobileSidebarOpen(true);
            }} 
            title={getTitle()}
            subtitle={currentView === 'donations' ? 'See the donations amount you gave from your income' : (
                currentView === 'accounts'
                  ? 'Manage your financial accounts'
                  : currentView === 'transactions'
                    ? 'Track and manage all your financial transactions'
                    : currentView === 'purchases'
                      ? 'Track and manage all your purchases.'
                      : currentView === 'lend-borrow'
                        ? 'Track and manage all your lending and borrowing activities'
                        : undefined
            )}
          />
          <main className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
      {/* Mobile sidebar overlay rendered outside the main flex container */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-[99999] flex">
          <aside className="w-16 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Sidebar 
              isOpen={isSidebarOpen} 
              onToggle={() => {
                setIsSidebarOpen(false);
                setIsMobileSidebarOpen(false);
              }}
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </aside>
          <div className="flex-1 h-full bg-black bg-opacity-50" onClick={() => {
            setIsSidebarOpen(false);
            setIsMobileSidebarOpen(false);
          }} />
        </div>
      )}
    </>
  );
}; 