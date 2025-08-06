import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { format } from 'date-fns';
import { Search, Filter, Download, TrendingUp, Heart, PiggyBank, CheckCircle, HelpCircle, Clock, Plus, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Tooltip } from '../components/common/Tooltip';
import { useAuthStore } from '../store/authStore';
import { DonationCardSkeleton, DonationTableSkeleton, DonationSummaryCardsSkeleton, DonationFiltersSkeleton } from '../components/Donations/DonationSkeleton';
import { toast } from 'sonner';

const DonationsSavingsPage: React.FC = () => {
  const { 
    donationSavingRecords, 
    fetchDonationSavingRecords, 
    getDonationSavingAnalytics,
    transactions,
    accounts,
    loading,
    setDonationSavingRecords // Added setDonationSavingRecords
  } = useFinanceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'fixed' | 'percent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'donated' | 'pending'>('all');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<'1month' | '3months' | '6months' | '1year'>('1month');

  // Add sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Refs for dropdown menus
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const dateMenuRef = useRef<HTMLDivElement>(null);

  // State for dropdown menus
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Sort function
  const sortData = (data: any[]) => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'original_amount':
          const transactionA = transactions.find(t => t.id === a.transaction_id);
          const transactionB = transactions.find(t => t.id === b.transaction_id);
          aValue = transactionA ? transactionA.amount : 0;
          bValue = transactionB ? transactionB.amount : 0;
          break;
        case 'donation_amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'mode':
          aValue = a.mode.toLowerCase();
          bValue = b.mode.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);

  // Memoize fetch function to prevent infinite loops
  const fetchDonationSavingRecordsCallback = useCallback(() => {
    useFinanceStore.getState().fetchDonationSavingRecords();
  }, []);

  // Get all unique currencies from accounts
  const allRecordCurrencies = Array.from(new Set(
    donationSavingRecords.map(record => {
      const transaction = transactions.find(t => t.id === record.transaction_id);
      const account = transaction ? accounts.find(a => a.id === transaction.account_id) : undefined;
      return account ? account.currency : null;
    }).filter((c): c is string => Boolean(c))
  ));

  // Get available currencies from user's profile and accounts as fallback
  const availableCurrencies = profile?.selected_currencies && profile.selected_currencies.length > 0
    ? profile.selected_currencies
    : Array.from(new Set(accounts.map(acc => acc.currency)));

  // Filter currencies based on user's selected currencies, with fallback to available currencies
  const recordCurrencies = profile?.selected_currencies && profile.selected_currencies.length > 0
    ? allRecordCurrencies.filter(currency => profile.selected_currencies?.includes?.(currency))
    : allRecordCurrencies.length > 0 
      ? allRecordCurrencies 
      : availableCurrencies;

  // Set default currency filter to user's preferred currency if available and valid
  useEffect(() => {
    if (!filterCurrency && recordCurrencies.length > 0) {
      // Prefer local_currency if available in selected currencies, else first available
      const defaultCurrency = profile?.local_currency && recordCurrencies.includes(profile.local_currency)
        ? profile.local_currency
        : recordCurrencies[0];
      setFilterCurrency(defaultCurrency);
    }
  }, [profile, recordCurrencies, filterCurrency, availableCurrencies]);

  useEffect(() => {
    if (user) {
      fetchDonationSavingRecordsCallback();
    }
  }, [user, fetchDonationSavingRecordsCallback]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for currency menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for date menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle status handler
  type DonationRecord = {
    id: string;
    status: string;
    [key: string]: any;
  };
  const handleToggleStatus = async (record: DonationRecord) => {
    const newStatus = record.status === 'donated' ? 'pending' : 'donated';
    // Optimistically update UI
    if (typeof setDonationSavingRecords === 'function') {
      setDonationSavingRecords(prev =>
        prev.map(r =>
          r.id === record.id ? { ...r, status: newStatus } : r
        )
      );
    } else if (Array.isArray(donationSavingRecords)) {
      // If using Zustand or similar, update via the store if possible
      if (typeof useFinanceStore.getState === 'function' && typeof useFinanceStore.setState === 'function') {
        useFinanceStore.setState({
          donationSavingRecords: donationSavingRecords.map(r =>
            r.id === record.id ? { ...r, status: newStatus } : r
          )
        });
      }
    }
    // Update in DB
    await supabase
      .from('donation_saving_records')
      .update({ status: newStatus })
      .eq('id', record.id);
    // Optionally: re-fetch in the background for consistency
    // fetchDonationSavingRecords();
  };

  // Currency symbol map
  const currencySymbols: Record<string, string> = {
    USD: '$', BDT: '৳', EUR: '€', GBP: '£', JPY: '¥', ALL: 'L', INR: '₹', CAD: '$', AUD: '$'
  };

  // Filter records by selected currency
  const filteredCurrencyRecords = filterCurrency
    ? donationSavingRecords.filter(record => {
        const transaction = transactions.find(t => t.id === record.transaction_id);
        const account = transaction ? accounts.find(a => a.id === transaction.account_id) : undefined;
        return account && account.currency === filterCurrency;
      })
    : [];

  // Date filtering logic
  const getDateRangeFilter = () => {
    const now = new Date();
    const monthsAgo = new Date();
    
    switch (filterDateRange) {
      case '1month':
        monthsAgo.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        monthsAgo.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        monthsAgo.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        monthsAgo.setFullYear(now.getFullYear() - 1);
        break;
      default:
        monthsAgo.setMonth(now.getMonth() - 1);
    }
    
    return { startDate: monthsAgo, endDate: now };
  };

  // Filter records by date range
  const { startDate, endDate } = getDateRangeFilter();
  const filteredByDateRecords = filteredCurrencyRecords.filter(record => {
    const recordDate = new Date(record.created_at);
    return recordDate >= startDate && recordDate <= endDate;
  });

  // Sort records: pending first, then by date (newest first)
  const sortedRecords = [...filteredByDateRecords].sort((a, b) => {
    // First priority: pending records come first
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Second priority: by date (newest first)
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  // Only sum donated records for analytics (filtered by currency and date)
  const donatedRecords = sortedRecords.filter(r => r.status === 'donated');
  const pendingRecords = sortedRecords.filter(r => r.status === 'pending');
  
  const analytics = {
    total_donated: donatedRecords.reduce((sum, r) => sum + (r.amount || 0), 0),
    top_month: (() => {
      // Calculate top month from filtered records
      const monthlyTotals: Record<string, number> = {};
      
      donatedRecords.forEach(record => {
        const monthKey = format(new Date(record.created_at), 'yyyy-MM');
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (record.amount || 0);
      });
      
      const topMonth = Object.entries(monthlyTotals)
        .sort(([, a], [, b]) => b - a)[0];
      
      return topMonth ? topMonth[0] : null;
    })(),
  };

  const filteredRecords = React.useMemo(() => {
    const filtered = sortedRecords.filter(record => {
      const displayTransactionId = transactions.find(t => t.id === record.transaction_id)?.transaction_id || '';
      const matchesSearch = searchTerm === '' || 
        (record.note?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((record.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
        (displayTransactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (`#${displayTransactionId}`.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMode = filterMode === 'all' || record.mode === filterMode;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      
      return matchesSearch && matchesMode && matchesStatus;
    });
    
    return sortData(filtered);
  }, [sortedRecords, searchTerm, filterMode, filterStatus, sortConfig, transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getTypeIcon = (type: 'saving' | 'donation') => {
    return type === 'saving' ? <PiggyBank className="w-4 h-4" /> : <Heart className="w-4 h-4" />;
  };

  const getTypeColor = (type: 'saving' | 'donation') => {
    return type === 'saving' ? 'text-blue-600' : 'text-green-600';
  };

  const getModeBadge = (mode: 'fixed' | 'percent', modeValue?: number, currency?: string) => {
    if (mode === 'percent') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">{typeof modeValue === 'number' ? `${modeValue}%` : '%'}</span>
      );
    }
    // For fixed, show the amount with currency symbol if available
    const symbol = currency ? (currencySymbols[currency] || currency) : '';
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{typeof modeValue === 'number' ? `${symbol}${modeValue}` : 'Fixed'}</span>
    );
  };

  const exportData = () => {
    const data = filteredRecords.map(record => ({
      Date: formatDate(record.created_at),
      Type: record.type,
      Amount: formatCurrency(record.amount),
      Mode: record.mode,
      Transaction: record.transaction_id,
      Note: record.note || '-'
    }));

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donations-savings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Add a helper function at the top of the component
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleCopyTransactionId = (transactionId: string) => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    toast.success('Transaction ID copied to clipboard');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Smooth skeleton for donations page */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters skeleton */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <DonationFiltersSkeleton />
          </div>
          
          {/* Summary cards skeleton */}
          <div className="p-4">
            <DonationSummaryCardsSkeleton />
          </div>
          
          {/* Table skeleton */}
          <div className="p-4">
            <DonationTableSkeleton rows={6} />
          </div>
        </div>
        
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <DonationCardSkeleton count={4} />
        </div>
      </div>
    );
  }

  const currencySymbol = filterCurrency ? (currencySymbols[filterCurrency] || filterCurrency) : '';

  return (
    <div className="dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation</h1> */}
      </div>
      {/* Removed subheading from body as it is now in the header */}

      {/* Unified Table View */}
      <div className="space-y-6">

        {/* Unified Filters and Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters Section */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full" style={{ marginBottom: 0 }}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <div>
                  <div className="relative">
                    <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${searchTerm ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-8 pr-2 py-1.5 text-[13px] h-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors ${
                        searchTerm 
                          ? 'border-blue-300 dark:border-blue-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={searchTerm ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                      placeholder="Search by transaction ID or note..."
                    />
                  </div>
                </div>

                {/* Currency Filter */}
                <div className="relative" ref={currencyMenuRef}>
                  <button
                    onClick={() => setShowCurrencyMenu(v => !v)}
                    className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                      filterCurrency 
                        ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={filterCurrency ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                  >
                    <span>{filterCurrency === '' ? (recordCurrencies.length > 0 ? 'All Currencies' : 'No Currencies') : filterCurrency}</span>
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCurrencyMenu && (
                    <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {recordCurrencies.map(currency => (
                        <button
                          key={currency}
                          onClick={() => { setFilterCurrency(currency); setShowCurrencyMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterCurrency === currency ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mode Filter */}
                <div className="relative" ref={modeMenuRef}>
                  <button
                    onClick={() => setShowModeMenu(v => !v)}
                    className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                      filterMode !== 'all' 
                        ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={filterMode !== 'all' ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                  >
                    <span>{capitalize(filterMode === 'all' ? 'All Modes' : filterMode)}</span>
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showModeMenu && (
                    <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => { setFilterMode('all'); setShowModeMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterMode === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        All Modes
                      </button>
                      <button
                        onClick={() => { setFilterMode('fixed'); setShowModeMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterMode === 'fixed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        Fixed
                      </button>
                      <button
                        onClick={() => { setFilterMode('percent'); setShowModeMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterMode === 'percent' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        Percentage
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative" ref={statusMenuRef}>
                  <button
                    onClick={() => setShowStatusMenu(v => !v)}
                    className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                      filterStatus !== 'all' 
                        ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={filterStatus !== 'all' ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                  >
                    <span>{capitalize(filterStatus === 'all' ? 'All Status' : filterStatus)}</span>
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusMenu && (
                    <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => { setFilterStatus('all'); setShowStatusMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterStatus === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        All Status
                      </button>
                      <button
                        onClick={() => { setFilterStatus('donated'); setShowStatusMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterStatus === 'donated' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        Donated
                      </button>
                      <button
                        onClick={() => { setFilterStatus('pending'); setShowStatusMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterStatus === 'pending' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        Pending
                      </button>
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div className="relative" ref={dateMenuRef}>
                  <button
                    onClick={() => setShowDateMenu(v => !v)}
                    className={`px-3 py-1.5 pr-2 text-[13px] h-8 rounded-md transition-colors flex items-center space-x-1.5 ${
                      filterDateRange 
                        ? 'text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={filterDateRange ? { background: 'linear-gradient(135deg, #3b82f61f 0%, #8b5cf633 100%)' } : {}}
                  >
                    <span>{filterDateRange === '1month' ? '1 Month' : 
                          filterDateRange === '3months' ? '3 Months' : 
                          filterDateRange === '6months' ? '6 Months' : 
                          filterDateRange === '1year' ? '1 Year' : '1 Month'}</span>
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDateMenu && (
                    <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => { setFilterDateRange('1month'); setShowDateMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterDateRange === '1month' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        1 Month
                      </button>
                      <button
                        onClick={() => { setFilterDateRange('3months'); setShowDateMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterDateRange === '3months' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        3 Months
                      </button>
                      <button
                        onClick={() => { setFilterDateRange('6months'); setShowDateMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterDateRange === '6months' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        6 Months
                      </button>
                      <button
                        onClick={() => { setFilterDateRange('1year'); setShowDateMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 ${filterDateRange === '1year' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}`}
                      >
                        1 Year
                      </button>
                    </div>
                  )}
                </div>

                {/* Clear Filters */}
                {(searchTerm || filterMode !== 'all' || filterStatus !== 'all' || filterDateRange !== '1month') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterMode('all');
                      setFilterStatus('all');
                      setFilterDateRange('1month');
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center"
                    title="Clear all filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
        </div>
        <button
          onClick={exportData}
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 mt-2 md:mt-0 text-[13px] h-8"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
            </div>
      </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
          <div className="flex items-center justify-between">
            <div className="text-left">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Donated</p>
                  <p className="font-bold text-green-600 dark:text-green-400" style={{ fontSize: '1.2rem' }}>{currencySymbol}{analytics.total_donated}</p>
                </div>
                <Heart className="text-green-600" style={{ fontSize: '1.2rem', width: '1.2rem', height: '1.2rem' }} />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
          <div className="flex items-center justify-between">
            <div className="text-left">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Pending</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400" style={{ fontSize: '1.2rem' }}>{currencySymbol}{pendingRecords.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <span className="text-blue-600" style={{ fontSize: '1.2rem' }}>📊</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-1.5 px-2">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Top Month</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400" style={{ fontSize: '1.2rem' }}>
                    {analytics.top_month ? format(new Date(analytics.top_month + '-01'), 'MMM yyyy') : '-'}
                  </p>
          </div>
                <TrendingUp className="text-purple-600" style={{ fontSize: '1.2rem', width: '1.2rem', height: '1.2rem' }} />
      </div>
            </div>
          </div>
          
          {/* Table Section */}
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-[14px]">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('original_amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Original Amount</span>
                      {getSortIcon('original_amount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('donation_amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Donation Amount</span>
                      {getSortIcon('donation_amount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('mode')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Mode</span>
                      {getSortIcon('mode')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      Transaction
                      <Tooltip content={
                        <>This is the reference ID generated for each transaction. You can use it to cross-reference with the main Transactions page.</>
                      }>
                        <span tabIndex={0} className="inline-flex items-center">
                      <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </span>
                      </Tooltip>
                    </span>
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
              </tr>
            </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.length === 0 ? (
                <tr>
                    <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donation records found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    Start tracking your donations and savings by adding your first record
                  </p>
                </td>
                </tr>
              ) : (
                  filteredRecords.map((record) => {
                  const transaction = transactions.find(t => t.id === record.transaction_id);
                  const account = transaction ? accounts.find(a => a.id === transaction.account_id) : undefined;
                  const currency = account ? account.currency : 'USD';
                  return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(record.created_at)}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction ? `${currencySymbols[currency] || currency}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {`${currencySymbols[currency] || currency}${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getModeBadge(record.mode, record.mode_value, currency)}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {transaction ? (
    <span className="inline-flex items-center gap-1">
      #{transaction.transaction_id}
      <button
        type="button"
        onClick={() => transaction.transaction_id && handleCopyTransactionId(transaction.transaction_id)}
        className="ml-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
        title="Copy transaction ID"
        aria-label="Copy transaction ID"
      >
        <Copy className="w-3 h-3" />
      </button>
    </span>
  ) : (
    '-'
  )}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                        onClick={() => handleToggleStatus(record)}
                            className={
                              record.status === 'donated'
                                ? "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-xs hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                                : "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
                            }
                            aria-label={record.status === 'donated' ? "Mark as Pending" : "Mark as Donated"}
                            title={record.status === 'donated' ? "Mark as Pending" : "Mark as Donated"}
                    >
                      {record.status === 'donated' ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                Donated
                              </>
                      ) : (
                              <>
                        <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                                Pending
                              </>
                      )}
                          </button>
                    </td>
                  </tr>
                );
                  })
                )}
            </tbody>
          </table>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default DonationsSavingsPage; 